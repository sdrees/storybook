import { start } from '@storybook/core-client';
import { decorateStory } from './decorators';

import { render, renderToCanvas } from './render';

const {
  configure: coreConfigure,
  clientApi,
  forceReRender,
} = start(renderToCanvas, {
  decorateStory,
  render,
});

export const { raw } = clientApi;

const FRAMEWORK = 'svelte';
export const storiesOf = (kind: string, m: any) =>
  clientApi.storiesOf(kind, m).addParameters({ framework: FRAMEWORK });
export const configure = (loadable: any, m: any) => coreConfigure(FRAMEWORK, loadable, m);

export { forceReRender };
