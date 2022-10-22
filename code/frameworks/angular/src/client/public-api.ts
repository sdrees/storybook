/* eslint-disable prefer-destructuring */
import type { ClientStoryApi, Loadable } from '@storybook/addons';
import { start } from '@storybook/core-client';
import { renderToDOM, render } from './render';
import decorateStory from './decorateStory';
import type { AngularFramework } from './types';

export * from './public-types';

const FRAMEWORK = 'angular';

interface ClientApi extends ClientStoryApi<AngularFramework['storyResult']> {
  configure(loader: Loadable, module: NodeModule): void;
  forceReRender(): void;
  raw: () => any; // todo add type
  load: (...args: any[]) => void;
}

const api = start(renderToDOM, { decorateStory, render });

export const storiesOf: ClientApi['storiesOf'] = (kind, m) => {
  return (api.clientApi.storiesOf(kind, m) as ReturnType<ClientApi['storiesOf']>).addParameters({
    framework: FRAMEWORK,
  });
};

export const configure: ClientApi['configure'] = (...args) => api.configure(FRAMEWORK, ...args);
export const forceReRender: ClientApi['forceReRender'] = api.forceReRender;
export const raw: ClientApi['raw'] = api.clientApi.raw;
