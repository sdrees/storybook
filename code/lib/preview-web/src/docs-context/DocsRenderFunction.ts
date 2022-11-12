import type { Framework, Parameters } from '@storybook/types';
import type { DocsContextProps } from './DocsContextProps';

export type DocsRenderFunction<TFramework extends Framework> = (
  docsContext: DocsContextProps<TFramework>,
  docsParameters: Parameters,
  element: HTMLElement,
  callback: () => void
) => void;
