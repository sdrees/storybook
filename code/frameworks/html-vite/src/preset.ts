import type { PresetProperty } from '@storybook/types';
import type { StorybookConfig } from './types';

export const core: PresetProperty<'core', StorybookConfig> = {
  builder: '@storybook/builder-vite',
  renderer: '@storybook/html',
};
