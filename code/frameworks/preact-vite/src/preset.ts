import { hasVitePlugins } from '@storybook/builder-vite';
import type { PresetProperty } from '@storybook/types';
import preact from '@preact/preset-vite';
import type { StorybookConfig } from './types';

export const core: PresetProperty<'core', StorybookConfig> = {
  builder: '@storybook/builder-vite',
  renderer: '@storybook/preact',
};

export const viteFinal: StorybookConfig['viteFinal'] = async (config) => {
  const { plugins = [] } = config;

  // Add Preact plugin if not present
  if (!(await hasVitePlugins(plugins, ['vite:preact-jsx']))) {
    plugins.push(preact());
  }

  // TODO: Add docgen plugin per issue https://github.com/storybookjs/storybook/issues/19739

  return config;
};
