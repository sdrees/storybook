// https://storybook.js.org/docs/react/addons/writing-presets
import { dirname, join } from 'path';
import type { Options, PresetProperty } from '@storybook/types';
import type { ConfigItem, TransformOptions } from '@babel/core';
import { loadPartialConfig } from '@babel/core';
import { getProjectRoot } from '@storybook/core-common';
import { configureConfig } from './config/webpack';
import { configureCss } from './css/webpack';
import { configureImports } from './imports/webpack';
import { configureRouting } from './routing/webpack';
import { configureStyledJsx } from './styledJsx/webpack';
import { configureImages } from './images/webpack';
import { configureRuntimeNextjsVersionResolution } from './utils';
import type { FrameworkOptions, StorybookConfig } from './types';
import { configureNextImport } from './nextImport/webpack';

export const addons: PresetProperty<'addons', StorybookConfig> = [
  dirname(require.resolve(join('@storybook/preset-react-webpack', 'package.json'))),
  dirname(require.resolve(join('@storybook/builder-webpack5', 'package.json'))),
];

const defaultFrameworkOptions: FrameworkOptions = {};

export const frameworkOptions = async (
  _: never,
  options: Options
): Promise<StorybookConfig['framework']> => {
  const config = await options.presets.apply<StorybookConfig['framework']>('framework');

  if (typeof config === 'string') {
    return {
      name: config,
      options: defaultFrameworkOptions,
    };
  }
  if (typeof config === 'undefined') {
    return {
      name: require.resolve('@storybook/nextjs') as '@storybook/nextjs',
      options: defaultFrameworkOptions,
    };
  }

  return {
    name: config.name,
    options: {
      ...defaultFrameworkOptions,
      ...config.options,
    },
  };
};

export const core: PresetProperty<'core', StorybookConfig> = async (config, options) => {
  const framework = await options.presets.apply<StorybookConfig['framework']>('framework');

  return {
    ...config,
    builder: {
      name: dirname(
        require.resolve(join('@storybook/builder-webpack5', 'package.json'))
      ) as '@storybook/builder-webpack5',
      options: typeof framework === 'string' ? {} : framework.options.builder || {},
    },
    renderer: dirname(require.resolve(join('@storybook/react', 'package.json'))),
  };
};

export const config: StorybookConfig['previewAnnotations'] = (entry = []) => [
  ...entry,
  require.resolve('@storybook/nextjs/preview.js'),
];

// Not even sb init - automigrate - running dev
// You're using a version of Nextjs prior to v10, which is unsupported by this framework.

export const babel = async (baseConfig: TransformOptions): Promise<TransformOptions> => {
  const configPartial = loadPartialConfig({
    ...baseConfig,
    filename: `${getProjectRoot()}/__fake__.js`,
  });

  const options = configPartial?.options;

  const isPresetConfigItem = (preset: any): preset is ConfigItem => {
    return typeof preset === 'object' && preset !== null && 'file' in preset;
  };

  const hasNextBabelConfig = options?.presets?.find(
    (preset) =>
      (Array.isArray(preset) && preset[0] === 'next/babel') ||
      preset === 'next/babel' ||
      (isPresetConfigItem(preset) && preset.file?.request === 'next/babel')
  );

  if (!hasNextBabelConfig) {
    options?.presets?.push('next/babel');
  }

  const presets = options?.presets?.filter(
    (preset) =>
      !(
        isPresetConfigItem(preset) &&
        (preset as ConfigItem).file?.request === require.resolve('@babel/preset-react')
      )
  );

  return {
    ...options,
    presets,
    babelrc: false,
    configFile: false,
  };
};

export const webpackFinal: StorybookConfig['webpackFinal'] = async (baseConfig, options) => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const frameworkOptions = await options.presets.apply<{ options: FrameworkOptions }>(
    'frameworkOptions'
  );
  const { options: { nextConfigPath } = {} } = frameworkOptions;
  const nextConfig = await configureConfig({
    baseConfig,
    nextConfigPath,
    configDir: options.configDir,
  });

  configureNextImport(baseConfig);
  configureRuntimeNextjsVersionResolution(baseConfig);
  configureImports(baseConfig);
  configureCss(baseConfig, nextConfig);
  configureImages(baseConfig);
  configureRouting(baseConfig);
  configureStyledJsx(baseConfig);

  return baseConfig;
};
