import { BuilderHandlerFn, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { StylePreprocessorOptions } from '@angular-devkit/build-angular';
import { sync as findUpSync } from 'find-up';
import { sync as readUpSync } from 'read-pkg-up';

import { CLIOptions } from '@storybook/types';
import { getEnvConfig, versions } from '@storybook/core-common';
import { addToGlobalContext } from '@storybook/telemetry';
import { buildDevStandalone, withTelemetry } from '@storybook/core-server';
import {
  AssetPattern,
  SourceMapUnion,
  StyleClass,
  StyleElement,
} from '@angular-devkit/build-angular/src/builders/browser/schema';
import { StandaloneOptions } from '../utils/standalone-options';
import { runCompodoc } from '../utils/run-compodoc';
import { printErrorDetails, errorSummary } from '../utils/error-handler';
import { AngularBuilderOptions, setup } from '../utils/setup';

addToGlobalContext('cliVersion', versions.storybook);

export type StorybookBuilderOptions = AngularBuilderOptions & {
  browserTarget?: string | null;
  tsConfig?: string;
  compodoc: boolean;
  compodocArgs: string[];
  enableProdMode?: boolean;
} & Pick<
    // makes sure the option exists
    CLIOptions,
    | 'port'
    | 'host'
    | 'configDir'
    | 'https'
    | 'sslCa'
    | 'sslCert'
    | 'sslKey'
    | 'smokeTest'
    | 'ci'
    | 'quiet'
    | 'disableTelemetry'
    | 'initialPath'
    | 'open'
    | 'docs'
    | 'debugWebpack'
    | 'webpackStatsJson'
    | 'statsJson'
    | 'loglevel'
    | 'previewUrl'
  >;

export type StorybookBuilderOutput = JsonObject & BuilderOutput & {};

const commandBuilder: BuilderHandlerFn<StorybookBuilderOptions> = async (options, context) => {
  const { tsConfig, angularBuilderContext, angularBuilderOptions } = await setup(options, context);

  const docTSConfig = findUpSync('tsconfig.doc.json', { cwd: options.configDir });

  if (options.compodoc) {
    await runCompodoc(
      {
        compodocArgs: [...options.compodocArgs, ...(options.quiet ? ['--silent'] : [])],
        tsconfig: docTSConfig ?? tsConfig,
      },
      context
    );
  }

  getEnvConfig(options, {
    port: 'SBCONFIG_PORT',
    host: 'SBCONFIG_HOSTNAME',
    staticDir: 'SBCONFIG_STATIC_DIR',
    configDir: 'SBCONFIG_CONFIG_DIR',
    ci: 'CI',
  });

  options.port = parseInt(`${options.port}`, 10);

  const {
    browserTarget,
    ci,
    configDir,
    docs,
    host,
    https,
    port,
    quiet,
    enableProdMode = false,
    smokeTest,
    sslCa,
    sslCert,
    sslKey,
    disableTelemetry,
    initialPath,
    open,
    debugWebpack,
    loglevel,
    webpackStatsJson,
    statsJson,
    previewUrl,
  } = options;

  const standaloneOptions: StandaloneOptions = {
    packageJson: readUpSync({ cwd: __dirname }).packageJson,
    ci,
    configDir,
    ...(docs ? { docs } : {}),
    excludeChunks: angularBuilderOptions.styles
      ?.filter((style) => typeof style !== 'string' && style.inject === false)
      .map((s: StyleClass) => s.bundleName),
    host,
    https,
    port,
    quiet,
    enableProdMode,
    smokeTest,
    sslCa,
    sslCert,
    sslKey,
    disableTelemetry,
    angularBrowserTarget: browserTarget,
    angularBuilderContext,
    angularBuilderOptions,
    tsConfig,
    initialPath,
    open,
    debugWebpack,
    webpackStatsJson,
    statsJson,
    loglevel,
    previewUrl,
  };

  const devPort = await runInstance(standaloneOptions);

  return { success: true, info: { port: devPort } };
};

export default createBuilder(commandBuilder);

async function runInstance(options: StandaloneOptions): Promise<number> {
  try {
    const { port } = await withTelemetry(
      'dev',
      {
        cliOptions: options,
        presetOptions: { ...options, corePresets: [], overridePresets: [] },
        printError: printErrorDetails,
      },
      () => buildDevStandalone(options)
    );
    return port;
  } catch (error) {
    throw new Error(errorSummary(error));
  }
}
