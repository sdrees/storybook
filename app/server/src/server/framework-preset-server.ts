import path from 'path';
import { findDistEsm } from '@storybook/core-common';
import type { StorybookConfig } from '@storybook/core-common';
import type { Configuration } from 'webpack';

export function webpack(config: Configuration) {
  config.module.rules.push({
    type: 'javascript/auto',
    test: /\.stories\.json$/,
    use: path.resolve(__dirname, './loader.js'),
  });

  config.module.rules.push({
    type: 'javascript/auto',
    test: /\.stories\.ya?ml/,
    use: [path.resolve(__dirname, './loader.js'), 'yaml-loader'],
  });

  return config;
}

export const config: StorybookConfig['config'] = (entry = []) => {
  return [...entry, findDistEsm(__dirname, 'client/preview/config')];
};
