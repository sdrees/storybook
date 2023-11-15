#!/usr/bin/env ../../node_modules/.bin/ts-node

import * as fs from 'fs-extra';
import path, { dirname, join, relative } from 'path';
import type { Options } from 'tsup';
import type { PackageJson } from 'type-fest';
import { build } from 'tsup';
import aliasPlugin from 'esbuild-plugin-alias';
import dedent from 'ts-dedent';
import slash from 'slash';
import { exec } from '../utils/exec';

import { globalPackages as globalPreviewPackages } from '../../code/lib/preview/src/globals/globals';
import { globalPackages as globalManagerPackages } from '../../code/ui/manager/src/globals/globals';

/* TYPES */

type Formats = 'esm' | 'cjs';
type BundlerConfig = {
  previewEntries: string[];
  managerEntries: string[];
  nodeEntries: string[];
  exportEntries: string[];
  externals: string[];
  pre: string;
  post: string;
  formats: Formats[];
};
type PackageJsonWithBundlerConfig = PackageJson & {
  bundler: BundlerConfig;
};
type DtsConfigSection = Pick<Options, 'dts' | 'tsconfig'>;

/* MAIN */

const run = async ({ cwd, flags }: { cwd: string; flags: string[] }) => {
  const {
    name,
    dependencies,
    peerDependencies,
    bundler: {
      managerEntries = [],
      previewEntries = [],
      nodeEntries = [],
      exportEntries = [],
      externals: extraExternals = [],
      pre,
      post,
      formats = ['esm', 'cjs'],
    },
  } = (await fs.readJson(join(cwd, 'package.json'))) as PackageJsonWithBundlerConfig;

  if (pre) {
    await exec(`node -r ${__dirname}/../node_modules/esbuild-register/register.js ${pre}`, { cwd });
  }

  const reset = hasFlag(flags, 'reset');
  const watch = hasFlag(flags, 'watch');
  const optimized = hasFlag(flags, 'optimized');

  if (reset) {
    await fs.emptyDir(join(process.cwd(), 'dist'));
  }

  const tasks: Promise<any>[] = [];

  const commonOptions: Options = {
    outDir: join(process.cwd(), 'dist'),
    silent: true,
    treeshake: true,
    shims: false,
    watch,
    clean: false,
    esbuildPlugins: [
      aliasPlugin({
        process: require.resolve('../node_modules/process/browser.js'),
        util: require.resolve('../node_modules/util/util.js'),
        assert: require.resolve('browser-assert'),
      }),
    ],
  };

  const commonExternals = [
    name,
    ...extraExternals,
    ...Object.keys(dependencies || {}),
    ...Object.keys(peerDependencies || {}),
  ];

  if (exportEntries.length > 0) {
    const { dtsConfig, tsConfigExists } = await getDTSConfigs({
      formats,
      entries: exportEntries,
      optimized,
    });

    tasks.push(
      build({
        ...commonOptions,
        ...(optimized ? dtsConfig : {}),
        entry: exportEntries,
        format: ['esm'],
        target: ['chrome100', 'safari15', 'firefox91'],
        platform: 'browser',
        external: [...commonExternals, ...globalManagerPackages, ...globalPreviewPackages],
        esbuildOptions: (options) => {
          /* eslint-disable no-param-reassign */
          options.conditions = ['module'];
          options.platform = 'browser';
          Object.assign(options, getESBuildOptions(optimized));
          /* eslint-enable no-param-reassign */
        },
      }),
      build({
        ...commonOptions,
        ...(optimized ? dtsConfig : {}),
        entry: exportEntries,
        format: ['cjs'],
        target: 'node16',
        platform: 'node',
        external: commonExternals,
        esbuildOptions: (options) => {
          /* eslint-disable no-param-reassign */
          options.conditions = ['module'];
          options.platform = 'node';
          Object.assign(options, getESBuildOptions(optimized));
          /* eslint-enable no-param-reassign */
        },
      })
    );

    if (tsConfigExists && !optimized) {
      tasks.push(...exportEntries.map(generateDTSMapperFile));
    }
  }

  if (managerEntries.length > 0) {
    tasks.push(
      build({
        ...commonOptions,
        entry: managerEntries.map((e: string) => slash(join(cwd, e))),
        outExtension: () => ({
          js: '.js',
        }),
        format: ['esm'],
        target: ['chrome100', 'safari15', 'firefox91'],
        platform: 'browser',
        external: [...commonExternals, ...globalManagerPackages],
        esbuildOptions: (options) => {
          /* eslint-disable no-param-reassign */
          options.conditions = ['module'];
          options.platform = 'browser';
          Object.assign(options, getESBuildOptions(optimized));
          /* eslint-enable no-param-reassign */
        },
      })
    );
  }
  if (previewEntries.length > 0) {
    tasks.push(
      build({
        ...commonOptions,
        entry: previewEntries.map((e: string) => slash(join(cwd, e))),
        outExtension: () => ({
          js: '.js',
        }),
        format: ['esm'],
        target: ['chrome100', 'safari15', 'firefox91'],
        platform: 'browser',
        external: [...commonExternals, ...globalPreviewPackages],
        esbuildOptions: (c) => {
          /* eslint-disable no-param-reassign */
          c.conditions = ['module'];
          c.platform = 'browser';
          Object.assign(c, getESBuildOptions(optimized));
          /* eslint-enable no-param-reassign */
        },
      })
    );
  }
  if (nodeEntries.length > 0) {
    tasks.push(
      build({
        ...commonOptions,
        entry: nodeEntries.map((e: string) => slash(join(cwd, e))),
        format: ['cjs'],
        target: 'node16',
        platform: 'node',
        external: commonExternals,
        esbuildOptions: (c) => {
          /* eslint-disable no-param-reassign */
          c.platform = 'node';
          Object.assign(c, getESBuildOptions(optimized));
          /* eslint-enable no-param-reassign */
        },
      })
    );
  }

  await Promise.all(tasks);

  if (post) {
    await exec(
      `node -r ${__dirname}/../node_modules/esbuild-register/register.js ${post}`,
      { cwd },
      { debug: true }
    );
  }

  console.log('done');
};

/* UTILS */

// keep in sync with code/lib/manager-api/src/index.ts

async function getDTSConfigs({
  formats,
  entries,
  optimized,
}: {
  formats: Formats[];
  entries: string[];
  optimized: boolean;
}) {
  const tsConfigPath = join(cwd, 'tsconfig.json');
  const tsConfigExists = await fs.pathExists(tsConfigPath);

  const dtsBuild = optimized && formats[0] && tsConfigExists ? formats[0] : undefined;

  const dtsConfig: DtsConfigSection = {
    tsconfig: tsConfigPath,
    dts: {
      entry: entries,
      resolve: true,
    },
  };

  return { dtsBuild, dtsConfig, tsConfigExists };
}

function getESBuildOptions(optimized: boolean) {
  return {
    logLevel: 'error',
    legalComments: 'none',
    minifyWhitespace: optimized,
    minifyIdentifiers: false,
    minifySyntax: optimized,
  };
}

async function generateDTSMapperFile(file: string) {
  const { name: entryName, dir } = path.parse(file);

  const pathName = join(process.cwd(), dir.replace('./src', 'dist'), `${entryName}.d.ts`);
  const srcName = join(process.cwd(), file);
  const rel = relative(dirname(pathName), dirname(srcName)).split(path.sep).join(path.posix.sep);

  await fs.ensureFile(pathName);
  await fs.writeFile(
    pathName,
    dedent`
      // dev-mode
      export * from '${rel}/${entryName}';
    `,
    { encoding: 'utf-8' }
  );
}

const hasFlag = (flags: string[], name: string) => !!flags.find((s) => s.startsWith(`--${name}`));

/* SELF EXECUTION */

const flags = process.argv.slice(2);
const cwd = process.cwd();

run({ cwd, flags }).catch((err: unknown) => {
  // We can't let the stack try to print, it crashes in a way that sets the exit code to 0.
  // Seems to have something to do with running JSON.parse() on binary / base64 encoded sourcemaps
  // in @cspotcode/source-map-support
  if (err instanceof Error) {
    console.error(err.stack);
  }
  process.exit(1);
});
