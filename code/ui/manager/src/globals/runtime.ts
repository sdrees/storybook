import * as REACT from 'react';
import * as REACT_DOM from 'react-dom';

import * as COMPONENTS from '@storybook/components';
import * as CHANNELS from '@storybook/channels';
import * as EVENTS from '@storybook/core-events';
import * as EVENTS_MANAGER_ERRORS from '@storybook/core-events/manager-errors';
import * as ROUTER from '@storybook/router';
import * as ICONS from '@storybook/icons';
import * as THEMING from '@storybook/theming';
import * as MANAGER_API from '@storybook/manager-api';
import * as TYPES from '@storybook/types';
import * as CLIENT_LOGGER from '@storybook/client-logger';

import type { globalsNameReferenceMap } from './globals';

// Here we map the name of a module to their VALUE in the global scope.
export const globalsNameValueMap: Required<Record<keyof typeof globalsNameReferenceMap, any>> = {
  react: REACT,
  'react-dom': REACT_DOM,
  '@storybook/components': COMPONENTS,
  '@storybook/channels': CHANNELS,
  '@storybook/core-events': EVENTS,
  '@storybook/core-events/manager-errors': EVENTS_MANAGER_ERRORS,
  '@storybook/router': ROUTER,
  '@storybook/theming': THEMING,
  '@storybook/icons': ICONS,
  '@storybook/manager-api': MANAGER_API,
  '@storybook/client-logger': CLIENT_LOGGER,
  '@storybook/types': TYPES,
};
