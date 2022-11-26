import type { Addon_ClientStoryApi, Addon_Loadable } from '@storybook/types';
import { start } from '@storybook/preview-api';

import { renderToCanvas, render } from './render';
import type { ServerRenderer } from './types';

const FRAMEWORK = 'server';

interface ClientApi extends Addon_ClientStoryApi<ServerRenderer['storyResult']> {
  configure(loader: Addon_Loadable, module: NodeModule): void;
  forceReRender(): void;
  raw: () => any; // todo add type
}

const api = start<ServerRenderer>(renderToCanvas, { render });

export const storiesOf: ClientApi['storiesOf'] = (kind, m) => {
  return (api.clientApi.storiesOf(kind, m) as ReturnType<ClientApi['storiesOf']>).addParameters({
    framework: FRAMEWORK,
  });
};

export const configure: ClientApi['configure'] = (...args) => api.configure(FRAMEWORK, ...args);
export const { raw } = api.clientApi;

export const { forceReRender } = api;
