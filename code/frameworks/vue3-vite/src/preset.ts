import type { PresetProperty } from '@storybook/types';
import { dirname, join } from 'path';
import type { PluginOption } from 'vite';
import { vueComponentMeta } from './plugins/vue-component-meta';
import { vueDocgen } from './plugins/vue-docgen';
import type { FrameworkOptions, StorybookConfig } from './types';

const getAbsolutePath = <I extends string>(input: I): I =>
  dirname(require.resolve(join(input, 'package.json'))) as any;

export const core: PresetProperty<'core'> = {
  builder: getAbsolutePath('@storybook/builder-vite'),
  renderer: getAbsolutePath('@storybook/vue3'),
};

export const viteFinal: StorybookConfig['viteFinal'] = async (config, options) => {
  const plugins: PluginOption[] = [];

  const framework = await options.presets.apply('framework');
  const frameworkOptions: FrameworkOptions =
    typeof framework === 'string' ? {} : framework.options ?? {};

  const docgenPlugin = frameworkOptions.docgen ?? 'vue-docgen-api';

  // add docgen plugin depending on framework option
  if (docgenPlugin === 'vue-component-meta') {
    plugins.push(await vueComponentMeta());
  } else {
    plugins.push(await vueDocgen());
  }

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
