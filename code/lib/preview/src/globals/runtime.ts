/* eslint-disable import/no-extraneous-dependencies */

import * as ADDONS from '@storybook/preview-api/dist/addons';
import * as CHANNEL_POSTMESSAGE from '@storybook/channel-postmessage';
import * as CHANNEL_WEBSOCKET from '@storybook/channel-websocket';
import * as CHANNELS from '@storybook/channels';
import * as CLIENT_API from '@storybook/preview-api/dist/client-api';
import * as CLIENT_LOGGER from '@storybook/client-logger';
import * as CORE_CLIENT from '@storybook/preview-api/dist/core-client';
import * as CORE_EVENTS from '@storybook/core-events';
import * as PREVIEW_API from '@storybook/preview-api';
import * as PREVIEW_WEB from '@storybook/preview-api/dist/preview-web';
import * as STORE from '@storybook/preview-api/dist/store';

import type { globals } from './types';

// Here we map the name of a module to their VALUE in the global scope.
export const values: Required<Record<keyof typeof globals, any>> = {
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
