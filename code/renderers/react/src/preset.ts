import type { StorybookConfig } from '@storybook/types';

import { join } from 'path';

export const addons: StorybookConfig['addons'] = [
  require.resolve('@storybook/react-dom-shim/dist/preset'),
];

export const previewAnnotations: StorybookConfig['previewAnnotations'] = async (input, options) => {
  const docsConfig = await options.presets.apply('docs', {}, options);
  const docsEnabled = Object.keys(docsConfig).length > 0;
  const result: string[] = [];

  return result
    .concat(input)
    .concat([join(__dirname, 'entry-preview.mjs')])
    .concat(docsEnabled ? [join(__dirname, 'entry-preview-docs.mjs')] : []);
};
