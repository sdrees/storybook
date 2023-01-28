import type {
  DocsContextProps,
  ModuleExport,
  NormalizedProjectAnnotations,
  PreparedMeta,
  Renderer,
  ResolvedModuleExportFromType,
  ResolvedModuleExportType,
} from '@storybook/types';
import { prepareMeta } from '@storybook/preview-api';
import { useContext } from 'react';
import { DocsContext } from './DocsContext';

export type Of = Parameters<DocsContextProps['resolveOf']>[0];

export type EnhancedResolvedModuleExportType<
  TType extends ResolvedModuleExportType,
  TRenderer extends Renderer = Renderer
> = TType extends 'component'
  ? ResolvedModuleExportFromType<TType, TRenderer> & {
      projectAnnotations: NormalizedProjectAnnotations<Renderer>;
    }
  : TType extends 'meta'
  ? ResolvedModuleExportFromType<TType, TRenderer> & { preparedMeta: PreparedMeta }
  : ResolvedModuleExportFromType<TType, TRenderer>;

/**
 * A hook to resolve the `of` prop passed to a block.
 * will return the resolved module
 * if the resolved module is a meta it will include a preparedMeta property similar to a preparedStory
 * if the resolved module is a component it will include the project annotations
 */
export const useOf = <
  TType extends ResolvedModuleExportType,
  TRenderer extends Renderer = Renderer
>(
  moduleExportOrType: ModuleExport | TType,
  validTypes?: TType[]
): EnhancedResolvedModuleExportType<TType, TRenderer> => {
  const context = useContext(DocsContext);
  const resolved = context.resolveOf(moduleExportOrType, validTypes);

  switch (resolved.type) {
    case 'component': {
      return {
        ...resolved,
        projectAnnotations: context.projectAnnotations,
      } as EnhancedResolvedModuleExportType<TType, TRenderer>;
    }
    case 'meta': {
      return {
        ...resolved,
        preparedMeta: prepareMeta(
          resolved.csfFile.meta,
          context.projectAnnotations,
          resolved.csfFile.moduleExports.default
        ),
      } as EnhancedResolvedModuleExportType<TType, TRenderer>;
    }
    case 'story':
    default: {
      return resolved as EnhancedResolvedModuleExportType<TType, TRenderer>;
    }
  }
};
