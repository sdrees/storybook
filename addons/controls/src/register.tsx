import React from 'react';
import addons, { types } from '@storybook/addons';
import { AddonPanel } from '@storybook/components';
import { API } from '@storybook/api';
import { ControlsPanel } from './components/ControlsPanel';
import { ADDON_ID, PARAM_KEY } from './constants';

addons.register(ADDON_ID, (api: API) => {
  addons.addPanel(ADDON_ID, {
    title: 'Controls',
    type: types.PANEL,
    paramKey: PARAM_KEY,
    render: ({ key, active }) => {
      if (!active || !api.getCurrentStoryData()) {
        return null;
      }
      return (
        <AddonPanel key={key} active={active}>
          <ControlsPanel />
        </AddonPanel>
      );
    },
  });
});
