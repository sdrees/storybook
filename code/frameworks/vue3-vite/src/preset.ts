import type { PresetProperty } from '@storybook/types';
import type { PluginOption } from 'vite';
import { dirname, join } from 'path';
import type { StorybookConfig } from './types';
import { vueDocgen } from './plugins/vue-docgen';

const getAbsolutePath = <I extends string>(input: I): I =>
  dirname(require.resolve(join(input, 'package.json'))) as any;

export const core: PresetProperty<'core'> = {
  builder: getAbsolutePath('@storybook/builder-vite'),
  renderer: getAbsolutePath('@storybook/vue3'),
};

export const viteFinal: StorybookConfig['viteFinal'] = async (config, { presets }) => {
  const plugins: PluginOption[] = [];

  // Add docgen plugin
  plugins.push(await vueDocgen());

  const { mergeConfig } = await import('vite');
  return mergeConfig(config, {
    plugins,
    resolve: {
      alias: {
        vue: 'vue/dist/vue.esm-bundler.js',
      },
    },
  });
};
