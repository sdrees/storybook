import type { PresetProperty } from '@storybook/types';
import { findDistEsm } from '@storybook/core-common';
import { hasDocsOrControls } from '@storybook/docs-tools';

export const previewAnnotations: PresetProperty<'previewAnnotations'> = (entry = [], options) => {
  if (!hasDocsOrControls(options)) return entry;
  return [...entry, findDistEsm(__dirname, 'client/docs/config')];
};
