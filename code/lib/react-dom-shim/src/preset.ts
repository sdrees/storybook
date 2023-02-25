import type { Options } from '@storybook/types';
// @ts-expect-error react-dom doesn't have this in export maps in v16, messing up TS
import { version } from 'react-dom/package.json';

export const webpackFinal = async (config: any, options: Options) => {
  const { legacyRootApi } = await options.presets.apply<{ legacyRootApi?: boolean }>(
    'frameworkOptions'
  );

  const isReact18 = version.startsWith('18') || version.startsWith('0.0.0');
  const useReact17 = legacyRootApi ?? !isReact18;
  if (useReact17) return config;

  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@storybook/react-dom-shim': '@storybook/react-dom-shim/dist/react-18',
      },
    },
  };
};

export const viteFinal = async (config: any, options: Options) => {
  const { legacyRootApi } = await options.presets.apply<{ legacyRootApi?: boolean }>(
    'frameworkOptions'
  );

  const isReact18 = version.startsWith('18') || version.startsWith('0.0.0');
  const useReact17 = legacyRootApi || !isReact18;
  if (useReact17) return config;

  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@storybook/react-dom-shim': '@storybook/react-dom-shim/dist/react-18',
      },
    },
  };
};
