import { dirname, join } from 'path';
import type { PresetProperty } from '@storybook/types';
import type { StorybookConfig } from './types';

export * from './types';

const getAbsolutePath = <I extends string>(input: I): I =>
  dirname(require.resolve(join(input, 'package.json'))) as any;

export const babel: PresetProperty<'babel'> = (config) => {
  return {
    ...config,
    plugins: [
      [
        require.resolve('@babel/plugin-transform-react-jsx'),
        { importSource: 'preact', runtime: 'automatic' },
      ],
      ...(config?.plugins || []).filter((p) => {
        const name = Array.isArray(p) ? p[0] : p;
        if (typeof name === 'string') {
          return !name.includes('plugin-transform-react-jsx');
        }
        return true;
      }),
    ],
    overrides: [
      // Transforms to apply only to first-party code:
      {
        exclude: '**/node_modules/**',
        presets: [require.resolve('@babel/preset-typescript')],
      },
    ],
  };
};

export const webpackFinal: StorybookConfig['webpackFinal'] = (config) => {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias || {}),
        react: getAbsolutePath('preact/compat'),
        'react-dom/test-utils': getAbsolutePath('preact/test-utils'),
        'react-dom': getAbsolutePath('preact/compat'),
        'react/jsx-runtime': getAbsolutePath('preact/jsx-runtime'),
      },
    },
  };
};

export const swc: PresetProperty<'swc'> = (config) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  return {
    ...config,
    jsc: {
      ...(config?.jsc ?? {}),
      transform: {
        ...(config?.jsc?.transform ?? {}),
        react: {
          ...(config?.jsc?.transform?.react ?? {}),
          runtime: 'automatic',
          importSource: 'preact',
          pragma: 'h',
          pragmaFrag: 'Fragment',
          development: isDevelopment,
        },
      },
    },
  };
};
