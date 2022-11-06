import { parameters as docsParams } from './docs/config';

export { renderToDOM, render } from './render';

export const parameters = { framework: 'preact' as const, ...docsParams };
