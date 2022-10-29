/* eslint-disable prefer-destructuring */
import type {
  Addon_ClientStoryApi,
  Addon_Loadable,
  Args,
  DecoratorFunction,
} from '@storybook/types';
import { start } from '@storybook/core-client';

import { renderToDOM, render } from './render';
import type { ReactFramework } from './types';

interface ClientApi extends Addon_ClientStoryApi<ReactFramework['storyResult']> {
  configure(loader: Addon_Loadable, module: NodeModule): void;
  forceReRender(): void;
  raw: () => any; // todo add type
}
const FRAMEWORK = 'react';

const api = start(renderToDOM, { render });

export const storiesOf: ClientApi['storiesOf'] = (kind, m) => {
  return (api.clientApi.storiesOf(kind, m) as ReturnType<ClientApi['storiesOf']>).addParameters({
    framework: FRAMEWORK,
  });
};

export const configure: ClientApi['configure'] = (...args) => api.configure(FRAMEWORK, ...args);
export const forceReRender: ClientApi['forceReRender'] = api.forceReRender;
export const raw: ClientApi['raw'] = api.clientApi.raw;

export type DecoratorFn<TArgs = Args> = DecoratorFunction<ReactFramework, TArgs>;
