import type { PresetProperty } from '@storybook/types';

export * from './types';

export const addons: PresetProperty<'addons'> = [
  require.resolve('@storybook/preset-svelte-webpack/dist/framework-preset-svelte'),
  require.resolve('@storybook/preset-svelte-webpack/dist/framework-preset-svelte-docs'),
];
