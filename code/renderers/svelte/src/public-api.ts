import { start } from '@storybook/preview-api';
import { decorateStory } from './decorators';

import type { SvelteRenderer } from './types';
import { render, renderToCanvas } from './render';

const {
  configure: coreConfigure,
  clientApi,
  forceReRender,
} = start<SvelteRenderer>(renderToCanvas, {
  decorateStory,
  render,
});

export const { raw } = clientApi;

const FRAMEWORK = 'svelte';
export const storiesOf = (kind: string, m: any) =>
  clientApi.storiesOf(kind, m).addParameters({ framework: FRAMEWORK });
export const configure = (loadable: any, m: any) => coreConfigure(FRAMEWORK, loadable, m);

export { forceReRender };
