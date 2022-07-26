import { parameters as docsParams } from './docs/config';

export const parameters = { framework: 'html' as const, ...docsParams };
export { decorators } from './docs/config';
export { renderToDOM } from './render';
