import path from 'path';
import type { StorybookConfig } from './types';

export * from './types';

export const babel: StorybookConfig['babelDefault'] = (config) => {
  return {
    ...config,
    plugins: [
      [
        require.resolve('@babel/plugin-transform-react-jsx'),
        { importSource: 'preact', runtime: 'automatic' },
      ],
      ...(config.plugins || []).filter((p) => {
        const name = Array.isArray(p) ? p[0] : p;
        if (typeof name === 'string') {
          return !name.includes('plugin-transform-react-jsx');
        }
        return true;
      }),
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
        react: path.dirname(require.resolve('preact/compat/package.json')),
        'react-dom/test-utils': path.dirname(require.resolve('preact/test-utils/package.json')),
        'react-dom': path.dirname(require.resolve('preact/compat/package.json')),
        'react/jsx-runtime': path.dirname(require.resolve('preact/jsx-runtime/package.json')),
      },
    },
  };
};
