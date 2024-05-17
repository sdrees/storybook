import { Target, targetFromTargetString } from '@angular-devkit/architect';
import { BuilderContext } from '@angular-devkit/architect';
import { JsonObject, logging } from '@angular-devkit/core';
import { sync as findUpSync } from 'find-up';
import { BrowserBuilderOptions, StylePreprocessorOptions } from '@angular-devkit/build-angular';
import { logger } from '@storybook/node-logger';
import {
  AssetPattern,
  SourceMapUnion,
  StyleElement,
} from '@angular-devkit/build-angular/src/builders/browser/schema';

type AngularBuilderOptions = {
  stylePreprocessorOptions?: StylePreprocessorOptions;
  styles?: StyleElement[];
  assets?: AssetPattern[];
  sourceMap?: SourceMapUnion;
};

type Options = AngularBuilderOptions & {
  browserTarget?: string | null;
  tsConfig?: string;
  configDir?: string;
};

export async function setup(options: Options, context: BuilderContext) {
  let browserOptions: (JsonObject & BrowserBuilderOptions) | undefined;
  let browserTarget: Target | undefined;

  if (options.browserTarget) {
    browserTarget = targetFromTargetString(options.browserTarget);
    browserOptions = await context.validateOptions<JsonObject & BrowserBuilderOptions>(
      await context.getTargetOptions(browserTarget),
      await context.getBuilderNameForTarget(browserTarget)
    );
  }

  const tsConfig =
    options.tsConfig ??
    findUpSync('tsconfig.json', { cwd: options.configDir }) ??
    browserOptions.tsConfig;

  const angularBuilderContext = getBuilderContext(context);

  const angularBuilderOptions = await getBuilderOptions(
    options.browserTarget,
    {
      ...(options.stylePreprocessorOptions
        ? { stylePreprocessorOptions: options.stylePreprocessorOptions }
        : {}),
      ...(options.styles ? { styles: options.styles } : {}),
      ...(options.assets ? { assets: options.assets } : {}),
      sourceMap: options.sourceMap ?? false,
    },
    tsConfig,
    options.configDir,
    angularBuilderContext
  );

  return {
    tsConfig,
    angularBuilderContext,
    angularBuilderOptions,
  };
}

/**
 * Get Builder Context
 * If storybook is not start by angular builder create dumb BuilderContext
 */
function getBuilderContext(builderContext: BuilderContext): BuilderContext {
  return (
    builderContext ??
    ({
      target: { project: 'noop-project', builder: '', options: {} },
      workspaceRoot: process.cwd(),
      getProjectMetadata: () => ({}),
      getTargetOptions: () => ({}),
      logger: new logging.Logger('Storybook'),
    } as unknown as BuilderContext)
  );
}

/**
 * Get builder options
 * Merge target options from browser target and from storybook options
 */
async function getBuilderOptions(
  angularBrowserTarget: string,
  angularBuilderOptions: AngularBuilderOptions,
  tsConfig: string,
  configDir: string,
  builderContext: BuilderContext
) {
  /**
   * Get Browser Target options
   */
  let browserTargetOptions: JsonObject = {};

  if (angularBrowserTarget) {
    const browserTarget = targetFromTargetString(angularBrowserTarget);

    browserTargetOptions = await builderContext.getTargetOptions(browserTarget);
  }

  /**
   * Merge target options from browser target options and from storybook options
   */
  const builderOptions = {
    ...browserTargetOptions,
    ...angularBuilderOptions,
    tsConfig:
      tsConfig ?? findUpSync('tsconfig.json', { cwd: configDir }) ?? browserTargetOptions.tsConfig,
  };
  logger.info(`=> Using angular project with "tsConfig:${builderOptions.tsConfig}"`);

  return builderOptions;
}
