import type { PresetProperty } from '@storybook/types';

export * from './types';

export const addons: PresetProperty<'addons'> = [
  require.resolve('@storybook/preset-vue-webpack/dist/framework-preset-vue'),
  require.resolve('@storybook/preset-vue-webpack/dist/framework-preset-vue-docs'),
];
