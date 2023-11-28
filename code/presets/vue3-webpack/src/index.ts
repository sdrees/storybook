import type { PresetProperty } from '@storybook/types';

export * from './types';

export const addons: PresetProperty<'addons'> = [
  require.resolve('@storybook/preset-vue3-webpack/dist/framework-preset-vue3'),
  require.resolve('@storybook/preset-vue3-webpack/dist/framework-preset-vue3-docs'),
];
