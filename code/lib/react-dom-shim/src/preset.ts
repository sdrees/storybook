import type { Options } from '@storybook/types';
import { join, dirname } from 'path';
import { readFile } from 'fs/promises';

/**
 * Get react-dom version from the resolvedReact preset, which points to either
 * a root react-dom dependency or the react-dom dependency shipped with addon-docs
 */
const getIsReactVersion18 = async (options: Options) => {
  const { legacyRootApi } =
    (await options.presets.apply<{ legacyRootApi?: boolean } | null>('frameworkOptions')) || {};

  if (legacyRootApi) {
    return false;
  }

  const resolvedReact = await options.presets.apply<{ reactDom?: string }>('resolvedReact', {});
  const reactDom = resolvedReact.reactDom || dirname(require.resolve('react-dom/package.json'));

  const { version } = JSON.parse(await readFile(join(reactDom, 'package.json'), 'utf-8'));
  return version.startsWith('18') || version.startsWith('0.0.0');
};

export const webpackFinal = async (config: any, options: Options) => {
  const isReactVersion18 = await getIsReactVersion18(options);
  if (isReactVersion18) {
    return config;
  }

  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@storybook/react-dom-shim': '@storybook/react-dom-shim/dist/react-16',
      },
    },
  };
};

export const viteFinal = async (config: any, options: Options) => {
  const isReactVersion18 = await getIsReactVersion18(options);
  if (isReactVersion18) {
    return config;
  }

  const alias = Array.isArray(config.resolve?.alias)
    ? config.resolve.alias.concat({
        find: /^@storybook\/react-dom-shim$/,
        replacement: '@storybook/react-dom-shim/dist/react-16',
      })
    : {
        ...config.resolve?.alias,
        '@storybook/react-dom-shim': '@storybook/react-dom-shim/dist/react-16',
      };

  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias,
    },
  };
};
