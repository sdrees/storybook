import { dirname, join } from 'path';
import { copy, writeFile, remove } from 'fs-extra';
import express from 'express';

import { logger } from '@storybook/node-logger';

import { globalExternals } from '@fal-works/esbuild-plugin-global-externals';
import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';
import aliasPlugin from 'esbuild-plugin-alias';

import { getTemplatePath, renderHTML } from './utils/template';
import { definitions } from './utils/globals';
import {
  BuilderBuildResult,
  BuilderFunction,
  BuilderStartOptions,
  BuilderStartResult,
  Compilation,
  ManagerBuilder,
  StarterFunction,
} from './types';
import { getData } from './utils/data';
import { safeResolve } from './utils/safeResolve';
import { readOrderedFiles } from './utils/files';

// eslint-disable-next-line import/no-mutable-exports
export let compilation: Compilation;
let asyncIterator: ReturnType<StarterFunction> | ReturnType<BuilderFunction>;

export const getConfig: ManagerBuilder['getConfig'] = async (options) => {
  const [addonsEntryPoints, customManagerEntryPoint, tsconfigPath] = await Promise.all([
    options.presets.apply('managerEntries', []),
    safeResolve(join(options.configDir, 'manager')),
    getTemplatePath('addon.tsconfig.json'),
  ]);

  return {
    entryPoints: customManagerEntryPoint
      ? [...addonsEntryPoints, customManagerEntryPoint]
      : addonsEntryPoints,
    outdir: join(options.outputDir || './', 'sb-addons'),
    format: 'esm',
    write: false,
    outExtension: { '.js': '.mjs' },
    loader: {
      '.js': 'jsx',
      '.png': 'dataurl',
      '.gif': 'dataurl',
      '.jpg': 'dataurl',
      '.jpeg': 'dataurl',
      '.svg': 'dataurl',
      '.webp': 'dataurl',
      '.webm': 'dataurl',
    },
    target: ['chrome100'],
    platform: 'browser',
    bundle: true,
    minify: false,
    sourcemap: true,

    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    jsx: 'transform',
    jsxImportSource: 'react',

    tsconfig: tsconfigPath,

    legalComments: 'external',
    plugins: [
      aliasPlugin({
        process: require.resolve('process/browser.js'),
        util: require.resolve('util/util.js'),
        assert: require.resolve('browser-assert'),
      }),
      globalExternals(definitions),
      pnpPlugin(),
    ],
    define: {
      'process.env.NODE_ENV': "'production'",
      'process.env': '{}',
      global: 'window',
      module: '{}',
    },
  };
};

export const executor = {
  get: async () => {
    const { build } = await import('esbuild');
    return build;
  },
};

/**
 * This function is a generator so that we can abort it mid process
 * in case of failure coming from other processes e.g. preview builder
 *
 * I am sorry for making you read about generators today :')
 */
const starter: StarterFunction = async function* starterGeneratorFn({
  startTime,
  options,
  router,
}) {
  logger.info('=> Starting manager..');

  const { config, customHead, features, instance, refs, template, title, logLevel, docsOptions } =
    await getData(options);

  yield;

  // make sure we clear output directory of addons dir before starting
  // this could cause caching issues where addons are loaded when they shouldn't
  const addonsDir = config.outdir;
  await remove(addonsDir);

  yield;

  compilation = await instance({
    ...config,
    watch: true,
  });

  yield;

  const coreDirOrigin = join(dirname(require.resolve('@storybook/ui/package.json')), 'dist');

  router.use(`/sb-addons`, express.static(addonsDir));
  router.use(`/sb-manager`, express.static(coreDirOrigin));

  const { cssFiles, jsFiles } = await readOrderedFiles(addonsDir);

  yield;

  const html = await renderHTML(
    template,
    title,
    customHead,
    cssFiles,
    jsFiles,
    features,
    refs,
    logLevel,
    docsOptions,
    options
  );

  yield;

  router.use(`/`, ({ path }, res, next) => {
    if (path === '/') {
      res.status(200).send(html);
    } else {
      next();
    }
  });

  return {
    bail,
    stats: {
      toJson: () => ({}),
    },
    totalTime: process.hrtime(startTime),
  } as BuilderStartResult;
};

/**
 * This function is a generator so that we can abort it mid process
 * in case of failure coming from other processes e.g. preview builder
 *
 * I am sorry for making you read about generators today :')
 */
const builder: BuilderFunction = async function* builderGeneratorFn({ startTime, options }) {
  if (!options.outputDir) {
    throw new Error('outputDir is required');
  }
  logger.info('=> Building manager..');
  const { config, customHead, features, instance, refs, template, title, logLevel, docsOptions } =
    await getData(options);
  yield;

  const addonsDir = config.outdir;
  const coreDirOrigin = join(dirname(require.resolve('@storybook/ui/package.json')), 'dist');
  const coreDirTarget = join(options.outputDir, `sb-manager`);

  compilation = await instance({
    ...config,

    minify: true,
    watch: false,
  });

  yield;

  const managerFiles = copy(coreDirOrigin, coreDirTarget);
  const { cssFiles, jsFiles } = await readOrderedFiles(addonsDir);

  yield;

  const html = await renderHTML(
    template,
    title,
    customHead,
    cssFiles,
    jsFiles,
    features,
    refs,
    logLevel,
    docsOptions,
    options
  );

  await Promise.all([
    //
    writeFile(join(options.outputDir, 'index.html'), html),
    managerFiles,
  ]);

  logger.trace({ message: '=> Manager built', time: process.hrtime(startTime) });

  return {
    toJson: () => ({}),
  } as BuilderBuildResult;
};

export const bail: ManagerBuilder['bail'] = async () => {
  if (asyncIterator) {
    try {
      // we tell the builder (that started) to stop ASAP and wait
      await asyncIterator.throw(new Error());
    } catch (e) {
      //
    }
  }

  if (compilation && compilation.stop) {
    try {
      compilation.stop();
      logger.warn('Force closed manager build');
    } catch (err) {
      logger.warn('Unable to close manager build!');
    }
  }
};

export const start = async (options: BuilderStartOptions) => {
  asyncIterator = starter(options);
  let result;

  do {
    // eslint-disable-next-line no-await-in-loop
    result = await asyncIterator.next();
  } while (!result.done);

  return result.value;
};

export const build = async (options: BuilderStartOptions) => {
  asyncIterator = builder(options);
  let result;

  do {
    // eslint-disable-next-line no-await-in-loop
    result = await asyncIterator.next();
  } while (!result.done);

  return result.value;
};

export const corePresets: ManagerBuilder['corePresets'] = [];
export const overridePresets: ManagerBuilder['overridePresets'] = [];
