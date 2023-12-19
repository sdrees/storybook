// https://storybook.js.org/docs/react/addons/writing-presets
import { dirname, join } from 'path';
import type { PresetProperty } from '@storybook/types';
import type { ConfigItem, PluginItem } from '@babel/core';
import { loadPartialConfig } from '@babel/core';
import { getProjectRoot } from '@storybook/core-common';
import { configureConfig } from './config/webpack';
import { configureCss } from './css/webpack';
import { configureImports } from './imports/webpack';
import { configureStyledJsx } from './styledJsx/webpack';
import { configureImages } from './images/webpack';
import { configureRSC } from './rsc/webpack';
import { configureRuntimeNextjsVersionResolution } from './utils';
import type { FrameworkOptions, StorybookConfig } from './types';
import TransformFontImports from './font/babel';
import { configureNextFont } from './font/webpack/configureNextFont';
import nextBabelPreset from './babel/preset';
import { configureNodePolyfills } from './nodePolyfills/webpack';
import { configureSWCLoader } from './swc/loader';

export const addons: PresetProperty<'addons'> = [
  dirname(require.resolve(join('@storybook/preset-react-webpack', 'package.json'))),
];

const defaultFrameworkOptions: FrameworkOptions = {};

export const frameworkOptions: PresetProperty<'framework'> = async (_, options) => {
  const config = await options.presets.apply('framework');

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

export const core: PresetProperty<'core'> = async (config, options) => {
  const framework = await options.presets.apply('framework');

  return {
    ...config,
    builder: {
      name: dirname(
        require.resolve(join('@storybook/builder-webpack5', 'package.json'))
      ) as '@storybook/builder-webpack5',
      options: {
        ...(typeof framework === 'string' ? {} : framework.options.builder || {}),
      },
    },
    renderer: dirname(require.resolve(join('@storybook/react', 'package.json'))),
  };
};

export const previewAnnotations: PresetProperty<'previewAnnotations'> = (
  entry = [],
  { features }
) => {
  const nextDir = dirname(require.resolve('@storybook/nextjs/package.json'));
  const result = [...entry, join(nextDir, 'dist/preview.mjs')];
  if (features?.experimentalNextRSC) {
    result.unshift(join(nextDir, 'dist/rsc/preview.mjs'));
  }
  return result;
};

// Not even sb init - automigrate - running dev
// You're using a version of Nextjs prior to v10, which is unsupported by this framework.

export const babel: PresetProperty<'babel'> = async (baseConfig) => {
  const configPartial = loadPartialConfig({
    ...baseConfig,
    filename: `${getProjectRoot()}/__fake__.js`,
  });

  const options = configPartial?.options;

  const isPresetConfigItem = (preset: any): preset is ConfigItem => {
    return typeof preset === 'object' && preset !== null && 'file' in preset;
  };

  const isNextBabelConfig = (preset: PluginItem) =>
    (Array.isArray(preset) && preset[0] === 'next/babel') ||
    preset === 'next/babel' ||
    (isPresetConfigItem(preset) && preset.file?.request === 'next/babel');

  const hasNextBabelConfig = options?.presets?.find(isNextBabelConfig);

  const presets =
    options?.presets?.filter(
      (preset) =>
        !(
          (isPresetConfigItem(preset) &&
            (preset as ConfigItem).file?.request === require.resolve('@babel/preset-react')) ||
          isNextBabelConfig(preset)
        )
    ) ?? [];

  if (hasNextBabelConfig) {
    if (Array.isArray(hasNextBabelConfig) && hasNextBabelConfig[1]) {
      presets.push([nextBabelPreset, hasNextBabelConfig[1]]);
    } else if (
      isPresetConfigItem(hasNextBabelConfig) &&
      hasNextBabelConfig.file?.request === 'next/babel'
    ) {
      presets.push([nextBabelPreset, hasNextBabelConfig.options]);
    } else {
      presets.push(nextBabelPreset);
    }
  } else {
    presets.push(nextBabelPreset);
  }

  const plugins = [...(options?.plugins ?? []), TransformFontImports];

  return {
    ...options,
    plugins,
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
  const { options: { nextConfigPath, builder } = {} } = frameworkOptions;
  const nextConfig = await configureConfig({
    baseConfig,
    nextConfigPath,
    configDir: options.configDir,
  });

  configureNextFont(baseConfig, builder?.useSWC);
  configureRuntimeNextjsVersionResolution(baseConfig);
  configureImports({ baseConfig, configDir: options.configDir });
  configureCss(baseConfig, nextConfig);
  configureImages(baseConfig, nextConfig);
  configureStyledJsx(baseConfig);
  configureNodePolyfills(baseConfig);

  if (options.features?.experimentalNextRSC) {
    configureRSC(baseConfig);
  }

  // TODO: In Storybook 8.0, we have to check whether the babel-compiler addon is used. Otherwise, swc should be used.
  if (builder?.useSWC) {
    await configureSWCLoader(baseConfig, options, nextConfig);
  }

  return baseConfig;
};
