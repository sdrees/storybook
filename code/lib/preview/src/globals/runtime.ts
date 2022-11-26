/* eslint-disable import/namespace */
import * as ADDONS from '../modules/addons';
import * as CHANNEL_POSTMESSAGE from '../modules/channel-postmessage';
import * as CHANNEL_WEBSOCKET from '../modules/channel-websocket';
import * as CHANNELS from '../modules/channels';
import * as CLIENT_API from '../modules/client-api';
import * as CLIENT_LOGGER from '../modules/client-logger';
import * as CORE_CLIENT from '../modules/core-client';
import * as CORE_EVENTS from '../modules/core-events';
import * as PREVIEW_API from '../modules/preview-api';
import * as PREVIEW_WEB from '../modules/preview-web';
import * as STORE from '../modules/store';

import type { Keys } from './types';

// Here we map the name of a module to their VALUE in the global scope.
export const values: Required<Record<keyof typeof Keys, any>> = {
  '@storybook/addons': ADDONS,
  '@storybook/channel-postmessage': CHANNEL_POSTMESSAGE,
  '@storybook/channel-websocket': CHANNEL_WEBSOCKET,
  '@storybook/channels': CHANNELS,
  '@storybook/client-api': CLIENT_API,
  '@storybook/client-logger': CLIENT_LOGGER,
  '@storybook/core-client': CORE_CLIENT,
  '@storybook/core-events': CORE_EVENTS,
  '@storybook/preview-api': PREVIEW_API,
  '@storybook/preview-web': PREVIEW_WEB,
  '@storybook/store': STORE,
};
