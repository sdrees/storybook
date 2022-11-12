import { sanitize } from '@storybook/csf';
import type {
  Framework,
  Store_ModuleExports,
  Store_NormalizedComponentAnnotations,
} from '@storybook/types';

import { normalizeInputTypes } from './normalizeInputTypes';

export function normalizeComponentAnnotations<TFramework extends Framework>(
  defaultExport: Store_ModuleExports['default'],
  title: string = defaultExport.title,
  importPath?: string
): Store_NormalizedComponentAnnotations<TFramework> {
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
