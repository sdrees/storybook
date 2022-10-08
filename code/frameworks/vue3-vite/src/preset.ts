import type { StorybookConfig } from '@storybook/builder-vite';
import { vueDocgen } from './plugins/vue-docgen';
import { hasPlugin } from './utils';

export const addons: StorybookConfig['addons'] = ['@storybook/vue3'];

export const core: StorybookConfig['core'] = {
  builder: '@storybook/builder-vite',
};

export const viteFinal: StorybookConfig['viteFinal'] = async (config, { presets }) => {
  const { plugins = [] } = config;

  // Add vue plugin if not present
  if (!hasPlugin(plugins, 'vite:vue')) {
    const { default: vue } = await import('@vitejs/plugin-vue');
    plugins.push(vue());
  }

  // Add docgen plugin
  plugins.push(vueDocgen());

  const updated = {
    ...config,
    plugins,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        vue: 'vue/dist/vue.esm-bundler.js',
      },
    },
  };
  return updated;
};
