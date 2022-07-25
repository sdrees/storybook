import 'jest-specific-snapshot';
import path from 'path';
import { mkdtemp as mkdtempCb } from 'fs';
import os from 'os';
import { promisify } from 'util';
import type { Configuration } from 'webpack';
import { resolvePathInStorybookCache, createFileSystemCache } from '@storybook/core-common';
import { executor as previewExecutor } from '@storybook/builder-webpack5';
import { executor as managerExecutor } from '@storybook/builder-manager';

import { sync as readUpSync } from 'read-pkg-up';
import { buildDevStandalone } from './build-dev';
import { buildStaticStandalone } from './build-static';

import { outputStats } from './utils/output-stats';

const { SNAPSHOT_OS } = global;
const mkdtemp = promisify(mkdtempCb);
const { packageJson } = readUpSync({ cwd: __dirname });

// this only applies to this file
jest.setTimeout(10000);

// FIXME: this doesn't work
const skipStoriesJsonPreset = [{ features: { buildStoriesJson: false, storyStoreV7: false } }];

jest.mock('@storybook/builder-webpack5', () => {
  const value = jest.fn(() => false);
  const actualBuilder = jest.requireActual('@storybook/builder-webpack5');
  // MUTATION! we couldn't mock webpack5, so we added a level of indirection instead
  actualBuilder.executor.get = () => value;
  actualBuilder.overridePresets = [...actualBuilder.overridePresets, skipStoriesJsonPreset];
  return actualBuilder;
});

jest.mock('@storybook/builder-manager', () => {
  const value = jest.fn();
  const actualBuilder = jest.requireActual('@storybook/builder-manager');
  // MUTATION!
  actualBuilder.executor.get = () => value;
  return actualBuilder;
});

jest.mock('@storybook/telemetry', () => ({
  getStorybookMetadata: jest.fn(() => ({})),
  telemetry: jest.fn(() => ({})),
}));
jest.mock('fs-extra', () => ({
  copy: jest.fn(() => undefined),
  writeFile: jest.fn(() => undefined),
  readFile: jest.fn((f) => ''),
  emptyDir: jest.fn(() => undefined),
  ensureDir: jest.fn(() => undefined),
  writeJSON: jest.fn(() => undefined),
  readJSON: jest.fn(() => ({})),
  pathExists: jest.fn(() => true),
}));

jest.mock('./utils/StoryIndexGenerator', () => {
  const { StoryIndexGenerator } = jest.requireActual('./utils/StoryIndexGenerator');
  return {
    StoryIndexGenerator: class extends StoryIndexGenerator {
      initialize() {
        return Promise.resolve(undefined);
      }

      getIndex() {
        return { stories: {}, v: 3 };
      }
    },
  };
});

jest.mock('./utils/stories-json', () => ({
  extractStoriesJson: () => Promise.resolve(),
  useStoriesJson: () => {},
}));

// we're not in the right directory for auto-title to work, so just
// stub it out
jest.mock('@storybook/store', () => {
  const actualStore = jest.requireActual('@storybook/store');
  return {
    ...actualStore,
    autoTitle: () => 'auto-title',
    autoTitleFromSpecifier: () => 'auto-title-from-specifier',
  };
});

jest.mock('http', () => ({
  ...jest.requireActual('http'),
  createServer: () => ({ listen: (_options, cb) => cb(), on: jest.fn() }),
}));
jest.mock('ws');
jest.mock('@storybook/node-logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    line: jest.fn(),
    trace: jest.fn(),
  },
}));
jest.mock('./utils/output-startup-information', () => ({
  outputStartupInformation: jest.fn(),
}));

jest.mock('./utils/output-stats');
jest.mock('./utils/open-in-browser', () => ({
  openInBrowser: jest.fn(),
}));

const cache = createFileSystemCache({
  basePath: resolvePathInStorybookCache('dev-server'),
  ns: 'storybook-test', // Optional. A grouping namespace for items.
});

const managerOnly = false;
const baseOptions = {
  ignorePreview: managerOnly,
  // FIXME: this should just be ignorePreview everywhere
  managerOnly, // production
  docsMode: false,
  cache,
  configDir: path.resolve(`${__dirname}/../../../examples/cra-ts-essentials/.storybook`),
  ci: true,
  managerCache: false,
};

const ROOT = process.cwd();
const NODE_MODULES = /.*node_modules/g;
const cleanRoots = (obj): any => {
  if (!obj) return obj;
  if (typeof obj === 'string')
    return obj.replace(ROOT, 'ROOT').replace(NODE_MODULES, 'NODE_MODULES');
  if (Array.isArray(obj)) return obj.map(cleanRoots);
  if (obj instanceof RegExp) return cleanRoots(obj.toString());
  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, val]) => {
        if (key === 'version' && typeof val === 'string') {
          return [key, '*'];
        }
        return [key, cleanRoots(val)];
      })
    );
  }
  return obj;
};

const getConfig = (fn: any, name): Configuration | null => {
  const call = fn.mock.calls.find((c) => c[0].name === name);
  if (!call) {
    return null;
  }
  return call[0];
};

const prepareSnap = (get: any, name): Pick<Configuration, 'module' | 'entry' | 'plugins'> => {
  const config = getConfig(get(), name);
  if (!config) {
    return null;
  }

  const keys = Object.keys(config);
  const { module, entry, plugins } = config;

  return cleanRoots({ keys, module, entry, plugins: plugins.map((p) => p.constructor.name) });
};

const snap = (name: string) => `__snapshots__/${name}`;

describe.each([
  ['cra-ts-essentials'],
  ['vue-3-cli'],
  ['web-components-kitchen-sink'],
  ['html-kitchen-sink'],
])('%s', (example) => {
  describe.each([
    ['manager', managerExecutor],
    ['preview', previewExecutor],
  ])('%s', (component, executor) => {
    beforeEach(async () => {
      jest.clearAllMocks();
      await cache.clear();
    });

    it.each([
      ['prod', buildStaticStandalone],
      ['dev', buildDevStandalone],
    ])('%s', async (mode, builder) => {
      const options = {
        ...baseOptions,
        configDir: path.resolve(`${__dirname}/../../../examples/${example}/.storybook`),
        // Only add an outputDir in production mode.
        outputDir:
          mode === 'prod' ? await mkdtemp(path.join(os.tmpdir(), 'storybook-static-')) : undefined,
        ignorePreview: component === 'manager',
        managerCache: component === 'preview',
        packageJson,
      };
      await builder(options);
      const config = prepareSnap(executor.get, component);
      expect(config).toMatchSpecificSnapshot(
        snap(`${example}_${component}-${mode}-${SNAPSHOT_OS}`)
      );
    });
  });
});

const progressPlugin = (config) =>
  config.plugins.find((p) => p.constructor.name === 'ProgressPlugin');

describe('dev cli flags', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await cache.clear();
  });

  const cliOptions = { ...baseOptions, packageJson };

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('baseline', async () => {
    await buildDevStandalone(cliOptions);
    const config = getConfig(previewExecutor.get, 'preview');
    expect(progressPlugin(config)).toBeTruthy();
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('--quiet', async () => {
    const options = { ...cliOptions, quiet: true };
    await buildDevStandalone(options);
    const config = getConfig(previewExecutor.get, 'preview');
    expect(progressPlugin(config)).toBeFalsy();
  });

  it('--webpack-stats-json calls output-stats', async () => {
    await buildDevStandalone(cliOptions);
    expect(outputStats).not.toHaveBeenCalled();

    await buildDevStandalone({ ...cliOptions, webpackStatsJson: '/tmp/dir' });
    expect(outputStats).toHaveBeenCalledWith(
      '/tmp/dir',
      expect.objectContaining({ toJson: expect.any(Function) })
    );
  });

  describe.each([
    ['root directory /', '/', "Won't remove directory '/'. Check your outputDir!"],
    ['empty string ""', '', "Won't remove current directory. Check your outputDir!"],
  ])('Invalid outputDir must throw: %s', (_, outputDir, expectedErrorMessage) => {
    const optionsWithInvalidDir = {
      ...cliOptions,
      outputDir,
    };

    it('production mode', async () => {
      expect.assertions(1);
      await expect(buildStaticStandalone(optionsWithInvalidDir)).rejects.toThrow(
        expectedErrorMessage
      );
    });
  });

  describe('Invalid staticDir must throw: root directory /', () => {
    const optionsWithInvalidStaticDir = {
      ...cliOptions,
      staticDir: ['/'],
    };

    it('production mode', async () => {
      expect.assertions(1);
      await expect(buildStaticStandalone(optionsWithInvalidStaticDir)).rejects.toThrow(
        "Won't copy root directory. Check your staticDirs!"
      );
    });
  });
});

describe('build cli flags', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await cache.clear();
  });
  const cliOptions = {
    ...baseOptions,
    outputDir: `${__dirname}/storybook-static`,
    packageJson,
  };

  it('does not call output-stats', async () => {
    await buildStaticStandalone(cliOptions);
    expect(outputStats).not.toHaveBeenCalled();
  });

  it('--webpack-stats-json calls output-stats', async () => {
    await buildStaticStandalone({ ...cliOptions, webpackStatsJson: '/tmp/dir' });
    expect(outputStats).toHaveBeenCalledWith(
      '/tmp/dir',
      expect.objectContaining({ toJson: expect.any(Function) })
    );
  });
});
