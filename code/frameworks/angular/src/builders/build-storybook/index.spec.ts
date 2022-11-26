import { Architect, createBuilder } from '@angular-devkit/architect';
import { TestingArchitectHost } from '@angular-devkit/architect/testing';
import { schema } from '@angular-devkit/core';
import * as path from 'path';

const buildDevStandaloneMock = jest.fn();
const buildStaticStandaloneMock = jest.fn();
const buildMock = {
  buildDevStandalone: buildDevStandaloneMock,
  buildStaticStandalone: buildStaticStandaloneMock,
};
jest.doMock('@storybook/core-server', () => buildMock);
jest.doMock('find-up', () => ({ sync: () => './storybook/tsconfig.ts' }));

const cpSpawnMock = {
  spawn: jest.fn(),
};
jest.doMock('child_process', () => cpSpawnMock);

describe('Build Storybook Builder', () => {
  let architect: Architect;
  let architectHost: TestingArchitectHost;

  beforeEach(async () => {
    const registry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);

    architectHost = new TestingArchitectHost();
    architect = new Architect(architectHost, registry);

    architectHost.addBuilder(
      '@angular-devkit/build-angular:browser',
      createBuilder(() => {
        return { success: true };
      })
    );
    architectHost.addTarget(
      { project: 'angular-cli', target: 'build-2' },
      '@angular-devkit/build-angular:browser',
      {
        outputPath: 'dist/angular-cli',
        index: 'src/index.html',
        main: 'src/main.ts',
        polyfills: 'src/polyfills.ts',
        tsConfig: 'src/tsconfig.app.json',
        assets: ['src/favicon.ico', 'src/assets'],
        styles: ['src/styles.css'],
        scripts: [],
      }
    );

    // This will either take a Node package name, or a path to the directory
    // for the package.json file.
    await architectHost.addBuilderFromPackage(path.join(__dirname, '../../..'));
  });

  beforeEach(() => {
    buildStaticStandaloneMock.mockImplementation((_options: unknown) => Promise.resolve());
    cpSpawnMock.spawn.mockImplementation(() => ({
      stdout: { on: () => {} },
      stderr: { on: () => {} },
      on: (_event: string, cb: any) => cb(0),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should start storybook with angularBrowserTarget', async () => {
    const run = await architect.scheduleBuilder('@storybook/angular:build-storybook', {
      browserTarget: 'angular-cli:build-2',
      compodoc: false,
    });

    const output = await run.result;

    await run.stop();

    expect(output.success).toBeTruthy();
    expect(cpSpawnMock.spawn).not.toHaveBeenCalledWith();
    expect(buildStaticStandaloneMock).toHaveBeenCalledWith({
      angularBrowserTarget: 'angular-cli:build-2',
      angularBuilderContext: expect.any(Object),
      angularBuilderOptions: {},
      configDir: '.storybook',
      docs: undefined,
      loglevel: undefined,
      quiet: false,
      outputDir: 'storybook-static',
      packageJson: expect.any(Object),
      mode: 'static',
      tsConfig: './storybook/tsconfig.ts',
      webpackStatsJson: false,
    });
  });

  it('should start storybook with tsConfig', async () => {
    const run = await architect.scheduleBuilder('@storybook/angular:build-storybook', {
      tsConfig: 'path/to/tsConfig.json',
      compodoc: false,
    });

    const output = await run.result;

    await run.stop();

    expect(output.success).toBeTruthy();
    expect(cpSpawnMock.spawn).not.toHaveBeenCalledWith();
    expect(buildStaticStandaloneMock).toHaveBeenCalledWith({
      angularBrowserTarget: null,
      angularBuilderContext: expect.any(Object),
      angularBuilderOptions: {},
      configDir: '.storybook',
      docs: undefined,
      loglevel: undefined,
      quiet: false,
      outputDir: 'storybook-static',
      packageJson: expect.any(Object),
      mode: 'static',
      tsConfig: 'path/to/tsConfig.json',
      webpackStatsJson: false,
    });
  });

  it('should build storybook with webpack stats.json', async () => {
    const run = await architect.scheduleBuilder('@storybook/angular:build-storybook', {
      tsConfig: 'path/to/tsConfig.json',
      compodoc: false,
      webpackStatsJson: true,
    });

    const output = await run.result;

    await run.stop();

    expect(output.success).toBeTruthy();
    expect(cpSpawnMock.spawn).not.toHaveBeenCalledWith();
    expect(buildStaticStandaloneMock).toHaveBeenCalledWith({
      angularBrowserTarget: null,
      angularBuilderContext: expect.any(Object),
      angularBuilderOptions: {},
      configDir: '.storybook',
      docs: undefined,
      loglevel: undefined,
      quiet: false,
      outputDir: 'storybook-static',
      packageJson: expect.any(Object),
      mode: 'static',
      tsConfig: 'path/to/tsConfig.json',
      webpackStatsJson: true,
    });
  });

  it('should throw error', async () => {
    buildStaticStandaloneMock.mockRejectedValue(true);

    const run = await architect.scheduleBuilder('@storybook/angular:start-storybook', {
      browserTarget: 'angular-cli:build-2',
      port: 4400,
      compodoc: false,
    });

    try {
      await run.result;

      expect(false).toEqual('Throw expected');
    } catch (error) {
      // eslint-disable-next-line jest/no-try-expect, jest/no-conditional-expect
      expect(error).toEqual(
        'Broken build, fix the error above.\nYou may need to refresh the browser.'
      );
    }
  });

  it('should run compodoc', async () => {
    const run = await architect.scheduleBuilder('@storybook/angular:build-storybook', {
      browserTarget: 'angular-cli:build-2',
    });

    const output = await run.result;

    await run.stop();

    expect(output.success).toBeTruthy();
    expect(cpSpawnMock.spawn).toHaveBeenCalledWith(
      'npx',
      ['compodoc', '-p', './storybook/tsconfig.ts', '-d', '', '-e', 'json'],
      {
        cwd: '',
        shell: true,
      }
    );
    expect(buildStaticStandaloneMock).toHaveBeenCalledWith({
      angularBrowserTarget: 'angular-cli:build-2',
      angularBuilderContext: expect.any(Object),
      angularBuilderOptions: {},
      configDir: '.storybook',
      docs: undefined,
      loglevel: undefined,
      quiet: false,
      outputDir: 'storybook-static',
      packageJson: expect.any(Object),
      mode: 'static',
      tsConfig: './storybook/tsconfig.ts',
      webpackStatsJson: false,
    });
  });

  it('should start storybook with styles options', async () => {
    const run = await architect.scheduleBuilder('@storybook/angular:build-storybook', {
      tsConfig: 'path/to/tsConfig.json',
      compodoc: false,
      styles: ['style.scss'],
    });

    const output = await run.result;

    await run.stop();

    expect(output.success).toBeTruthy();
    expect(cpSpawnMock.spawn).not.toHaveBeenCalledWith();
    expect(buildStaticStandaloneMock).toHaveBeenCalledWith({
      angularBrowserTarget: null,
      angularBuilderContext: expect.any(Object),
      angularBuilderOptions: { styles: ['style.scss'] },
      configDir: '.storybook',
      docs: undefined,
      loglevel: undefined,
      quiet: false,
      outputDir: 'storybook-static',
      packageJson: expect.any(Object),
      mode: 'static',
      tsConfig: 'path/to/tsConfig.json',
      webpackStatsJson: false,
    });
  });
});
