import { start } from '@storybook/preview-api';

import './globals';
import type { EmberRenderer } from './types';
import { renderToCanvas } from './render';

const { configure: coreConfigure, clientApi, forceReRender } = start<EmberRenderer>(renderToCanvas);

export const { raw } = clientApi;

const FRAMEWORK = 'ember';
export const storiesOf = (kind: string, m: any) =>
  clientApi.storiesOf(kind, m).addParameters({ framework: FRAMEWORK });
export const configure = (loadable: any, m: any) => coreConfigure(FRAMEWORK, loadable, m);

export { forceReRender };
