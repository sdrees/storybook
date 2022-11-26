import { sanitize } from '@storybook/csf';
import type {
  Renderer,
  Store_ModuleExports,
  Store_NormalizedComponentAnnotations,
} from '@storybook/types';

import { normalizeInputTypes } from './normalizeInputTypes';

export function normalizeComponentAnnotations<TRenderer extends Renderer>(
  defaultExport: Store_ModuleExports['default'],
  title: string = defaultExport.title,
  importPath?: string
): Store_NormalizedComponentAnnotations<TRenderer> {
  const { id, argTypes } = defaultExport;
  return {
    id: sanitize(id || title),
    ...defaultExport,
    title,
    ...(argTypes && { argTypes: normalizeInputTypes(argTypes) }),
    parameters: {
      fileName: importPath,
      ...defaultExport.parameters,
    },
  };
}
