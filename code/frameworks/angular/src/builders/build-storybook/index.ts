import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { sync as findUpSync } from 'find-up';
import { sync as readUpSync } from 'read-pkg-up';

import { CLIOptions } from '@storybook/types';
import { getEnvConfig, versions } from '@storybook/core-common';
import { addToGlobalContext } from '@storybook/telemetry';

import { buildStaticStandalone, withTelemetry } from '@storybook/core-server';
import { StyleClass } from '@angular-devkit/build-angular/src/builders/browser/schema';
import { StandaloneOptions } from '../utils/standalone-options';
import { runCompodoc } from '../utils/run-compodoc';
import { errorSummary, printErrorDetails } from '../utils/error-handler';
import { AngularBuilderOptions, setup } from '../utils/setup';

addToGlobalContext('cliVersion', versions.storybook);

export type StorybookBuilderOptions = AngularBuilderOptions & {
  browserTarget?: string | null;
  tsConfig?: string;
  test: boolean;
  docs: boolean;
  compodoc: boolean;
  compodocArgs: string[];
  enableProdMode?: boolean;
} & Pick<
    // makes sure the option exists
    CLIOptions,
    | 'outputDir'
    | 'configDir'
    | 'loglevel'
    | 'quiet'
    | 'test'
    | 'webpackStatsJson'
    | 'statsJson'
    | 'disableTelemetry'
    | 'debugWebpack'
    | 'previewUrl'
  >;

export type StorybookBuilderOutput = JsonObject & BuilderOutput & { [key: string]: any };

type StandaloneBuildOptions = StandaloneOptions & { outputDir: string; excludeChunks: string[] };

const commandBuilder = async (
  options: StorybookBuilderOptions,
  context: BuilderContext
): Promise<BuilderOutput> => {
  const { tsConfig, angularBuilderContext, angularBuilderOptions } = await setup(options, context);

  const docTSConfig = findUpSync('tsconfig.doc.json', { cwd: options.configDir });

  if (options.compodoc) {
    await runCompodoc(
      { compodocArgs: options.compodocArgs, tsconfig: docTSConfig ?? tsConfig },
      context
    );
  }

  getEnvConfig(options, {
    staticDir: 'SBCONFIG_STATIC_DIR',
    outputDir: 'SBCONFIG_OUTPUT_DIR',
    configDir: 'SBCONFIG_CONFIG_DIR',
  });

  const {
    configDir,
    docs,
    loglevel,
    test,
    outputDir,
    quiet,
    enableProdMode = true,
    webpackStatsJson,
    statsJson,
    debugWebpack,
    disableTelemetry,
    previewUrl,
  } = options;

  const standaloneOptions: StandaloneBuildOptions = {
    packageJson: readUpSync({ cwd: __dirname }).packageJson,
    configDir,
    ...(docs ? { docs } : {}),
    excludeChunks: angularBuilderOptions.styles
      ?.filter((style) => typeof style !== 'string' && style.inject === false)
      .map((s: StyleClass) => s.bundleName),
    loglevel,
    outputDir,
    test,
    quiet,
    enableProdMode,
    disableTelemetry,
    angularBrowserTarget: options.browserTarget,
    angularBuilderContext,
    angularBuilderOptions,
    tsConfig,
    webpackStatsJson,
    statsJson,
    debugWebpack,
    previewUrl,
  };

  await runInstance({ ...standaloneOptions, mode: 'static' });

  return { success: true };
};

export default createBuilder(commandBuilder);

async function runInstance(options: StandaloneBuildOptions) {
  try {
    await withTelemetry(
      'build',
      {
        cliOptions: options,
        presetOptions: { ...options, corePresets: [], overridePresets: [] },
        printError: printErrorDetails,
      },
      () => buildStaticStandalone(options)
    );
  } catch (error) {
    throw new Error(errorSummary(error));
  }
}
