import { PresetProperty } from '@storybook/types';
import { hasDocsOrControls } from '@storybook/docs-tools';

export const previewAnnotations: PresetProperty<'previewAnnotations'> = (entry = [], options) => {
  if (!hasDocsOrControls(options)) return entry;
  return [...entry, require.resolve('../client/docs/config')];
};
