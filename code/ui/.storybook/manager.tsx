import { addons, types } from '@storybook/manager-api';
import { IconButton, Icons } from '@storybook/components';
import startCase from 'lodash/startCase.js';
import React, { Fragment } from 'react';

addons.setConfig({
  sidebar: {
    renderLabel: ({ name, type }) => (type === 'story' ? name : startCase(name)),
  },
});
