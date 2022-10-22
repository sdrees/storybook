/* eslint-disable prefer-destructuring */
import { start } from '@storybook/core-client';
import type { ClientStoryApi, Loadable } from '@storybook/addons';

import { renderToDOM } from './render';
import type { PreactFramework } from './types';

export interface ClientApi extends ClientStoryApi<PreactFramework['storyResult']> {
  configure(loader: Loadable, module: NodeModule): void;
  forceReRender(): void;
  raw: () => any; // todo add type
  load: (...args: any[]) => void;
}

const FRAMEWORK = 'preact';
const api = start(renderToDOM);

export const storiesOf: ClientApi['storiesOf'] = (kind, m) => {
  return (api.clientApi.storiesOf(kind, m) as ReturnType<ClientApi['storiesOf']>).addParameters({
    framework: FRAMEWORK,
  });
};

export const configure: ClientApi['configure'] = (...args) => api.configure(FRAMEWORK, ...args);
export const forceReRender: ClientApi['forceReRender'] = api.forceReRender;
export const raw: ClientApi['raw'] = api.clientApi.raw;
