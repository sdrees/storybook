import express, { Router } from 'express';
import compression from 'compression';

import type {
  CoreConfig,
  DocsOptions,
  Options,
  StorybookConfig,
  VersionCheck,
} from '@storybook/types';

import { normalizeStories, logConfig } from '@storybook/core-common';

import { telemetry } from '@storybook/telemetry';
import { getMiddleware } from './utils/middleware';
import { getServerAddresses } from './utils/server-address';
import { getServer } from './utils/server-init';
import { useStatics } from './utils/server-statics';
import { useStoriesJson } from './utils/stories-json';
import { useStorybookMetadata } from './utils/metadata';
import type { ServerChannel } from './utils/get-server-channel';
import { getServerChannel } from './utils/get-server-channel';

import { openInBrowser } from './utils/open-in-browser';
import { getManagerBuilder, getPreviewBuilder } from './utils/get-builders';
import { StoryIndexGenerator } from './utils/StoryIndexGenerator';
import { summarizeIndex } from './utils/summarizeIndex';

// @ts-expect-error (Converted from ts-ignore)
export const router: Router = new Router();

export const DEBOUNCE = 100;

const versionStatus = (versionCheck: VersionCheck) => {
  if (versionCheck.error) return 'error';
  if (versionCheck.cached) return 'cached';
  return 'success';
};

export async function storybookDevServer(options: Options) {
  const app = express();

  const [server, features, core] = await Promise.all([
    getServer(app, options),
    options.presets.apply<StorybookConfig['features']>('features'),
    options.presets.apply<CoreConfig>('core'),
  ]);

  const serverChannel = getServerChannel(server);

  // try get index generator, if failed, send telemetry without storyCount, then rethrow the error
  const initializedStoryIndexGenerator: Promise<StoryIndexGenerator> = getStoryIndexGenerator(
    features,
    options,
    serverChannel
  );

  doTelemetry(core, initializedStoryIndexGenerator, options);

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
  const usingStatics = useStatics(router, options);

  getMiddleware(options.configDir)(router);
  app.use(router);

  const { port, host } = options;
  const proto = options.https ? 'https' : 'http';
  const { address, networkAddress } = getServerAddresses(port, host, proto);

  const listening = new Promise<void>((resolve, reject) => {
    // @ts-expect-error (Following line doesn't match TypeScript signature at all 🤔)
    server.listen({ port, host }, (error: Error) => (error ? reject(error) : resolve()));
  });

  const builderName = typeof core?.builder === 'string' ? core.builder : core?.builder?.name;

  const [previewBuilder, managerBuilder] = await Promise.all([
    getPreviewBuilder(builderName, options.configDir),
    getManagerBuilder(),
  ]);

  if (options.debugWebpack) {
    logConfig('Preview webpack config', await previewBuilder.getConfig(options));
  }

  Promise.all([initializedStoryIndexGenerator, listening, usingStatics]).then(async () => {
    if (!options.ci && !options.smokeTest && options.open) {
      openInBrowser(host ? networkAddress : address);
    }
  });

  const managerResult = await managerBuilder.start({
    startTime: process.hrtime(),
    options,
    router,
    server,
    channel: serverChannel,
  });

  let previewResult;

  if (!options.ignorePreview) {
    previewResult = await previewBuilder
      .start({
        startTime: process.hrtime(),
        options,
        router,
        server,
        channel: serverChannel,
      })
      .catch(async (e: any) => {
        await managerBuilder?.bail().catch();
        // For some reason, even when Webpack fails e.g. wrong main.js config,
        // the preview may continue to print to stdout, which can affect output
        // when we catch this error and process those errors (e.g. telemetry)
        // gets overwritten by preview progress output. Therefore, we should bail the preview too.
        await previewBuilder?.bail().catch();

        // re-throw the error
        throw e;
      });
  }

  return { previewResult, managerResult, address, networkAddress };
}
async function doTelemetry(
  core: CoreConfig,
  initializedStoryIndexGenerator: Promise<StoryIndexGenerator>,
  options: Options
) {
  if (!core?.disableTelemetry) {
    initializedStoryIndexGenerator.then(async (generator) => {
      const storyIndex = await generator?.getIndex();
      const { versionCheck, versionUpdates } = options;
      const payload = storyIndex
        ? {
            versionStatus: versionUpdates ? versionStatus(versionCheck) : 'disabled',
            storyIndex: summarizeIndex(storyIndex),
          }
        : undefined;
      telemetry('dev', payload, { configDir: options.configDir });
    });
  }

  if (!core?.disableProjectJson) {
    useStorybookMetadata(router, options.configDir);
  }
}

async function getStoryIndexGenerator(
  features: {
    postcss?: boolean;
    buildStoriesJson?: boolean;
    previewCsfV3?: boolean;
    storyStoreV7?: boolean;
    breakingChangesV7?: boolean;
    interactionsDebugger?: boolean;
    babelModeV7?: boolean;
    argTypeTargetsV7?: boolean;
    warnOnLegacyHierarchySeparator?: boolean;
  },
  options: Options,
  serverChannel: ServerChannel
) {
  let initializedStoryIndexGenerator: Promise<StoryIndexGenerator> = Promise.resolve(undefined);
  if (features?.buildStoriesJson || features?.storyStoreV7) {
    const workingDir = process.cwd();
    const directories = {
      configDir: options.configDir,
      workingDir,
    };
    const stories = options.presets.apply('stories');
    const storyIndexers = options.presets.apply('storyIndexers', []);
    const docsOptions = options.presets.apply<DocsOptions>('docs', {});
    const normalizedStories = normalizeStories(await stories, directories);

    const generator = new StoryIndexGenerator(normalizedStories, {
      ...directories,
      storyIndexers: await storyIndexers,
      docs: await docsOptions,
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
  }
  return initializedStoryIndexGenerator;
}
