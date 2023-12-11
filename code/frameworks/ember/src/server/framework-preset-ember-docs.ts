import type { PresetProperty } from '@storybook/types';
import { hasDocsOrControls } from '@storybook/docs-tools';
import { findDistFile } from '../util';

export const previewAnnotations: PresetProperty<'previewAnnotations'> = (entry = [], options) => {
  if (!hasDocsOrControls(options)) return entry;
  return [...entry, findDistFile(__dirname, 'client/preview/docs/config')];
};
