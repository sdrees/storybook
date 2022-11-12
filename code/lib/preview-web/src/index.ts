// FIXME: breaks builder-vite, remove this in 7.0
export { composeConfigs } from '@storybook/store';
export type { ProjectAnnotations as WebProjectAnnotations } from '@storybook/types';

export { Preview } from './Preview';
export { PreviewWithSelection } from './PreviewWithSelection';
export { PreviewWeb } from './PreviewWeb';

export { simulatePageLoad, simulateDOMContentLoaded } from './simulate-pageload';

export { DocsContext } from './docs-context/DocsContext';
export type { DocsContextProps } from './docs-context/DocsContextProps';
export type { DocsRenderFunction } from './docs-context/DocsRenderFunction';
