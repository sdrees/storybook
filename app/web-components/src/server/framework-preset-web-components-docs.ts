import { findDistEsm, StorybookConfig } from '@storybook/core-common';
import { hasDocsOrControls } from '@storybook/docs-tools';

export const previewAnnotations: StorybookConfig['previewAnnotations'] = (entry = [], options) => {
  if (!hasDocsOrControls(options)) return entry;
  return [...entry, findDistEsm(__dirname, 'client/docs/config')];
};
