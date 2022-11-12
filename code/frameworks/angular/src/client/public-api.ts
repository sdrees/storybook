/* eslint-disable prefer-destructuring */
import { Addon_ClientStoryApi, Addon_Loadable } from '@storybook/types';
import { start } from '@storybook/core-client';
import { renderToCanvas, render } from './render';
import decorateStory from './decorateStory';
import { AngularFramework } from './types';

export * from './public-types';

const FRAMEWORK = 'angular';

interface ClientApi extends Addon_ClientStoryApi<AngularFramework['storyResult']> {
  configure(loader: Addon_Loadable, module: NodeModule): void;
  forceReRender(): void;
  raw: () => any; // todo add type
  load: (...args: any[]) => void;
}

const api = start(renderToCanvas, { decorateStory, render });

export const storiesOf: ClientApi['storiesOf'] = (kind, m) => {
  return (api.clientApi.storiesOf(kind, m) as ReturnType<ClientApi['storiesOf']>).addParameters({
    framework: FRAMEWORK,
  });
};

export const configure: ClientApi['configure'] = (...args) => api.configure(FRAMEWORK, ...args);
export const forceReRender: ClientApi['forceReRender'] = api.forceReRender;
export const raw: ClientApi['raw'] = api.clientApi.raw;
