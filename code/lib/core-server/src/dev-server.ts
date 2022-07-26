import express, { Router } from 'express';
import compression from 'compression';

import {
  CoreConfig,
  DocsOptions,
  Options,
  StorybookConfig,
  normalizeStories,
  logConfig,
} from '@storybook/core-common';

import { telemetry } from '@storybook/telemetry';
import { getMiddleware } from './utils/middleware';
import { getServerAddresses } from './utils/server-address';
import { getServer } from './utils/server-init';
import { useStatics } from './utils/server-statics';
import { useStoriesJson } from './utils/stories-json';
import { useStorybookMetadata } from './utils/metadata';
import { getServerChannel } from './utils/get-server-channel';

import { openInBrowser } from './utils/open-in-browser';
import { getBuilders } from './utils/get-builders';
import { StoryIndexGenerator } from './utils/StoryIndexGenerator';

// @ts-ignore
export const router: Router = new Router();

export const DEBOUNCE = 100;

export async function storybookDevServer(options: Options) {
  const startTime = process.hrtime();
  const app = express();
  const server = await getServer(app, options);
  const serverChannel = getServerChannel(server);

  const features = await options.presets.apply<StorybookConfig['features']>('features');
  const core = await options.presets.apply<CoreConfig>('core');
  // try get index generator, if failed, send telemetry without storyCount, then rethrow the error
  let initializedStoryIndexGenerator: Promise<StoryIndexGenerator> = Promise.resolve(undefined);
  if (features?.buildStoriesJson || features?.storyStoreV7) {
    try {
      const workingDir = process.cwd();
      const directories = {
        configDir: options.configDir,
        workingDir,
      };
      const normalizedStories = normalizeStories(
        await options.presets.apply('stories'),
        directories
      );
      const storyIndexers = await options.presets.apply('storyIndexers', []);
      const docsOptions = await options.presets.apply<DocsOptions>('docs', {});

      const generator = new StoryIndexGenerator(normalizedStories, {
        ...directories,
        storyIndexers,
        docs: docsOptions,
        workingDir,
        storiesV2Compatibility: !features?.breakingChangesV7 && !features?.storyStoreV7,
        storyStoreV7: features?.storyStoreV7,
      });

      initializedStoryIndexGenerator = generator.initialize().then(() => generator);

      useStoriesJson({
        router,
        initializedStoryIndexGenerator,
        normalizedStories,
        serverChannel,
        workingDir,
      });
    } catch (err) {
      if (!core?.disableTelemetry) {
        telemetry('start');
      }
      throw err;
    }
  }

  if (!core?.disableTelemetry) {
    initializedStoryIndexGenerator.then(async (generator) => {
      if (!generator) {
        return;
      }

      const storyIndex = await generator.getIndex();
      const payload = storyIndex
        ? {
            storyIndex: {
              storyCount: Object.keys(storyIndex.entries).length,
              version: storyIndex.v,
            },
          }
        : undefined;
      telemetry('start', payload, { configDir: options.configDir });
    });
  }

  if (!core?.disableProjectJson) {
    useStorybookMetadata(router, options.configDir);
  }

  app.use(compression({ level: 1 }));

  if (typeof options.extendServer === 'function') {
    options.extendServer(server);
  }

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    // These headers are required to enable SharedArrayBuffer
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer
    next();
  });

  if (core?.crossOriginIsolated) {
    app.use((req, res, next) => {
      // These headers are required to enable SharedArrayBuffer
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer
      res.header('Cross-Origin-Opener-Policy', 'same-origin');
      res.header('Cross-Origin-Embedder-Policy', 'require-corp');
      next();
    });
  }

  // User's own static files
  await useStatics(router, options);

  getMiddleware(options.configDir)(router);
  app.use(router);

  const { port, host } = options;
  const proto = options.https ? 'https' : 'http';
  const { address, networkAddress } = getServerAddresses(port, host, proto);

  await new Promise<void>((resolve, reject) => {
    // FIXME: Following line doesn't match TypeScript signature at all 🤔
    // @ts-ignore
    server.listen({ port, host }, (error: Error) => (error ? reject(error) : resolve()));
  });

  const [previewBuilder, managerBuilder] = await getBuilders(options);

  if (options.debugWebpack) {
    logConfig('Preview webpack config', await previewBuilder.getConfig(options));
  }

  const preview = options.ignorePreview
    ? Promise.resolve()
    : previewBuilder.start({
        startTime,
        options,
        router,
        server,
      });

  const manager = managerBuilder.start({
    startTime,
    options,
    router,
    server,
  });

  const [previewResult, managerResult] = await Promise.all([
    preview.catch(async (err) => {
      await managerBuilder?.bail();
      throw err;
    }),
    manager
      // TODO #13083 Restore this when compiling the preview is fast enough
      // .then((result) => {
      //   if (!options.ci && !options.smokeTest) openInBrowser(address);
      //   return result;
      // })
      .catch(async (err) => {
        await previewBuilder?.bail();
        throw err;
      }),
  ]);

  // TODO #13083 Remove this when compiling the preview is fast enough
  if (!options.ci && !options.smokeTest && options.open) {
    openInBrowser(host ? networkAddress : address);
  }

  return { previewResult, managerResult, address, networkAddress };
}
