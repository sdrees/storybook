import * as CHANNELS from '@storybook/channels';
import * as CLIENT_LOGGER from '@storybook/client-logger';
import * as CORE_EVENTS from '@storybook/core-events';
import * as CORE_EVENTS_PREVIEW_ERRORS from '@storybook/core-events/preview-errors';
import * as PREVIEW_API from '@storybook/preview-api';
import * as TYPES from '@storybook/types';
import * as GLOBAL from '@storybook/global';

import type { globalsNameReferenceMap } from './globals';

// Here we map the name of a module to their VALUE in the global scope.
export const globalsNameValueMap: Required<Record<keyof typeof globalsNameReferenceMap, any>> = {
  '@storybook/channels': CHANNELS,
  '@storybook/client-logger': CLIENT_LOGGER,
  '@storybook/core-events': CORE_EVENTS,
  '@storybook/core-events/preview-errors': CORE_EVENTS_PREVIEW_ERRORS,
  '@storybook/preview-api': PREVIEW_API,
  '@storybook/global': GLOBAL,
  '@storybook/types': TYPES,
};
