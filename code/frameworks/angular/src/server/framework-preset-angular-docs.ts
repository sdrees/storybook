import path from 'path';
import { StorybookConfig } from '@storybook/types';
import { hasDocsOrControls } from '@storybook/docs-tools';

export const previewAnnotations: StorybookConfig['previewAnnotations'] = (entry = [], options) => {
  if (!hasDocsOrControls(options)) return entry;
  return [...entry, path.join(__dirname, '../../dist/client/docs/config')];
};
