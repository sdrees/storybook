import type {
  AnyFramework,
  ComponentTitle,
  Parameters,
  Path,
  Store_CSFFile,
  Store_ModuleExports,
  Store_NormalizedComponentAnnotations,
} from '@storybook/types';
import { isExportStory } from '@storybook/csf';
import { logger } from '@storybook/client-logger';

import { normalizeStory } from './normalizeStory';
import { normalizeComponentAnnotations } from './normalizeComponentAnnotations';

const checkGlobals = (parameters: Parameters) => {
  const { globals, globalTypes } = parameters;
  if (globals || globalTypes) {
    logger.error(
      'Global args/argTypes can only be set globally',
      JSON.stringify({
        globals,
        globalTypes,
      })
    );
  }
};

const checkStorySort = (parameters: Parameters) => {
  const { options } = parameters;
  if (options?.storySort) logger.error('The storySort option parameter can only be set globally');
};

const checkDisallowedParameters = (parameters?: Parameters) => {
  if (!parameters) return;

  checkGlobals(parameters);
  checkStorySort(parameters);
};

// Given the raw exports of a CSF file, check and normalize it.
export function processCSFFile<TFramework extends AnyFramework>(
  moduleExports: Store_ModuleExports,
  importPath: Path,
  title: ComponentTitle
): Store_CSFFile<TFramework> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { default: defaultExport, __namedExportsOrder, ...namedExports } = moduleExports;

  const meta: Store_NormalizedComponentAnnotations<TFramework> =
    normalizeComponentAnnotations<TFramework>(defaultExport, title, importPath);
  checkDisallowedParameters(meta.parameters);

  const csfFile: Store_CSFFile<TFramework> = { meta, stories: {} };

  Object.keys(namedExports).forEach((key) => {
    if (isExportStory(key, meta)) {
      const storyMeta = normalizeStory(key, namedExports[key], meta);
      checkDisallowedParameters(storyMeta.parameters);

      csfFile.stories[storyMeta.id] = storyMeta;
    }
  });

  return csfFile;
}
