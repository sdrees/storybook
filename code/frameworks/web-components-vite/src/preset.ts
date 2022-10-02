import type { StorybookConfig } from '@storybook/builder-vite';

export const addons: StorybookConfig['addons'] = ['@storybook/web-components'];

export const core: StorybookConfig['core'] = {
  builder: '@storybook/builder-vite',
};
