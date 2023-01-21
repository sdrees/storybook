import type { DocsContextProps } from '@storybook/types';
import { prepareMeta } from '@storybook/preview-api';
import { useContext } from 'react';
import { DocsContext } from './DocsContext';

export type Of = Parameters<DocsContextProps['resolveOf']>[0];
/**
 * A hook to resolve the `of` prop passed to a block.
 * will return the resolved module
 * if the resolved module is a meta it will include a preparedMeta property similar to a preparedStory
 * if the resolved module is a component it will include the project annotations
 */
export const useOf = (...args: Parameters<DocsContextProps['resolveOf']>) => {
  const context = useContext(DocsContext);
  const resolved = context.resolveOf(...args);

  switch (resolved.type) {
    case 'component': {
      return { ...resolved, projectAnnotations: context.projectAnnotations };
    }
    case 'meta': {
      return {
        ...resolved,
        preparedMeta: prepareMeta(
          resolved.csfFile.meta,
          context.projectAnnotations,
          resolved.csfFile.moduleExports.default
        ),
      };
    }
    case 'story':
    default: {
      return resolved;
    }
  }
};
