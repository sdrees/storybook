import { sanitize } from '@storybook/csf';
import type { AnyFramework } from '@storybook/csf';

import type { ModuleExports, NormalizedComponentAnnotations } from '../types';
import { normalizeInputTypes } from './normalizeInputTypes';

export function normalizeComponentAnnotations<TFramework extends AnyFramework>(
  defaultExport: ModuleExports['default'],
  title: string = defaultExport.title,
  importPath?: string
): NormalizedComponentAnnotations<TFramework> {
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
