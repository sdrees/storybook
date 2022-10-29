import type { Addon_ClientStoryApi, Addon_Loadable } from '@storybook/types';
import type { App } from 'vue';
import { start } from '@storybook/core-client';

import type { VueFramework } from './types';
import { decorateStory } from './decorateStory';

import { render, renderToDOM } from './render';

const FRAMEWORK = 'vue3';

interface ClientApi extends Addon_ClientStoryApi<VueFramework['storyResult']> {
  configure(loader: Addon_Loadable, module: NodeModule): void;
  forceReRender(): void;
  raw: () => any; // todo add type
  load: (...args: any[]) => void;
  app: App;
}

const api = start(renderToDOM, { decorateStory, render });

export const storiesOf: ClientApi['storiesOf'] = (kind, m) => {
  return (api.clientApi.storiesOf(kind, m) as ReturnType<ClientApi['storiesOf']>).addParameters({
    framework: FRAMEWORK,
  });
};

export const configure: ClientApi['configure'] = (...args) => api.configure(FRAMEWORK, ...args);
export const { forceReRender } = api;
export const { raw } = api.clientApi;
export { setup } from './render';
