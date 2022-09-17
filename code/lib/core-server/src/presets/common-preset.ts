import fs from 'fs-extra';
import deprecate from 'util-deprecate';
import {
  CLIOptions,
  getPreviewBodyTemplate,
  getPreviewHeadTemplate,
  getPreviewMainTemplate,
  loadEnvs,
} from '@storybook/core-common';
import type {
  Options,
  CoreConfig,
  StorybookConfig,
  StoryIndexer,
  IndexerOptions,
} from '@storybook/core-common';
import { loadCsf } from '@storybook/csf-tools';

const warnConfigField = deprecate(() => {},
`You (or an addon) are using the 'config' preset field. This has been replaced by 'previewAnnotations' and will be removed in 8.0`);

export const babel = async (_: unknown, options: Options) => {
  const { presets } = options;

  return presets.apply('babelDefault', {}, options);
};

export const title = (previous: string, options: Options) =>
  previous || options.packageJson.name || false;

export const logLevel = (previous: any, options: Options) => previous || options.loglevel || 'info';

export const previewHead = async (base: any, { configDir, presets }: Options) => {
  const interpolations = await presets.apply<Record<string, string>>('env');
  return getPreviewHeadTemplate(configDir, interpolations);
};

export const env = async () => {
  return loadEnvs({ production: true }).raw;
};

export const previewBody = async (base: any, { configDir, presets }: Options) => {
  const interpolations = await presets.apply<Record<string, string>>('env');
  return getPreviewBodyTemplate(configDir, interpolations);
};

export const previewMainTemplate = () => getPreviewMainTemplate();

export const typescript = () => ({
  check: false,
  // 'react-docgen' faster but produces lower quality typescript results
  reactDocgen: 'react-docgen-typescript',
  reactDocgenTypescriptOptions: {
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    propFilter: (prop: any) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    // NOTE: this default cannot be changed
    savePropValueAsString: true,
  },
});

const optionalEnvToBoolean = (input: string | undefined): boolean | undefined => {
  if (input === undefined) {
    return undefined;
  }
  if (input.toUpperCase() === 'FALSE') {
    return false;
  }
  if (input.toUpperCase() === 'TRUE') {
    return true;
  }
  if (typeof input === 'string') {
    return true;
  }
  return undefined;
};

/**
 * If for some reason this config is not applied, the reason is that
 * likely there is an addon that does `export core = () => ({ someConfig })`,
 * instead of `export core = (existing) => ({ ...existing, someConfig })`,
 * just overwriting everything and not merging with the existing values.
 */
export const core = async (existing: CoreConfig, options: Options): Promise<CoreConfig> => ({
  ...existing,
  disableTelemetry: options.disableTelemetry === true,
  enableCrashReports:
    options.enableCrashReports || optionalEnvToBoolean(process.env.STORYBOOK_ENABLE_CRASH_REPORTS),
});

export const previewAnnotations = async (base: any, options: Options) => {
  const config = await options.presets.apply('config', [], options);

  if (config.length > 0) warnConfigField();

  return [...config, require.resolve('@storybook/core-client/dist/esm/globals/globals'), ...base];
};

export const features = async (
  existing: StorybookConfig['features']
): Promise<StorybookConfig['features']> => ({
  ...existing,
  postcss: true,
  warnOnLegacyHierarchySeparator: true,
  buildStoriesJson: false,
  storyStoreV7: true,
  breakingChangesV7: true,
  interactionsDebugger: false,
  babelModeV7: true,
  argTypeTargetsV7: true,
  previewMdx2: false,
});

export const storyIndexers = async (indexers?: StoryIndexer[]) => {
  const csfIndexer = async (fileName: string, opts: IndexerOptions) => {
    const code = (await fs.readFile(fileName, 'utf-8')).toString();
    return loadCsf(code, { ...opts, fileName }).parse();
  };
  return [
    {
      test: /(stories|story)\.[tj]sx?$/,
      indexer: csfIndexer,
    },
    ...(indexers || []),
  ];
};

export const frameworkOptions = async (
  _: never,
  options: Options
): Promise<Record<string, any> | null> => {
  const config = await options.presets.apply<StorybookConfig['framework']>('framework');

  if (typeof config === 'string') {
    return {};
  }

  if (typeof config === 'undefined') {
    return null;
  }

  return config.options;
};

export const docs = (
  docsOptions: StorybookConfig['docs'],
  { docs: docsMode }: CLIOptions
): StorybookConfig['docs'] => ({
  ...docsOptions,
  docsMode,
});
