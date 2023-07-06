import React from 'react';
import { addons, types } from '@storybook/manager-api';

import { StoryPanel } from './StoryPanel';
import { ADDON_ID, PANEL_ID } from './index';

addons.register(ADDON_ID, (api) => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Code',
    id: 'code',
    render: ({ active, key }) => (active ? <StoryPanel key={key} api={api} /> : null),
    paramKey: 'storysource',
  });
});
