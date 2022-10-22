import { start } from '@storybook/core-client';
import type { ClientStoryApi, Loadable } from '@storybook/addons';

import { renderToDOM, render } from './render';
import type { ServerFramework } from './types';

const FRAMEWORK = 'server';

interface ClientApi extends ClientStoryApi<ServerFramework['storyResult']> {
  configure(loader: Loadable, module: NodeModule): void;
  forceReRender(): void;
  raw: () => any; // todo add type
}

const api = start(renderToDOM, { render });

export const storiesOf: ClientApi['storiesOf'] = (kind, m) => {
  return (api.clientApi.storiesOf(kind, m) as ReturnType<ClientApi['storiesOf']>).addParameters({
    framework: FRAMEWORK,
  });
};

export const configure: ClientApi['configure'] = (...args) => api.configure(FRAMEWORK, ...args);
export const { raw } = api.clientApi;

export const { forceReRender } = api;
