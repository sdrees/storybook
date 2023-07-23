import React from 'react';
import { addons, types, useAddonState } from '@storybook/manager-api';
import { Badge, Spaced } from '@storybook/components';
import { ADDON_ID, PANEL_ID, PARAM_KEY } from './constants';
import { VisionSimulator } from './components/VisionSimulator';
import { A11YPanel } from './components/A11YPanel';
import type { Results } from './components/A11yContext';
import { A11yContextProvider } from './components/A11yContext';

const Title = () => {
  const [addonState] = useAddonState<Results>(ADDON_ID);
  const violationsNb = addonState?.violations?.length || 0;
  const incompleteNb = addonState?.incomplete?.length || 0;
  const count = violationsNb + incompleteNb;

  const suffix = count === 0 ? '' : <Badge status="neutral">{count}</Badge>;

  return (
    <div>
      <Spaced col={1}>
        <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>Accessibility</span>
        {suffix}
      </Spaced>
    </div>
  );
};

addons.register(ADDON_ID, (api) => {
  addons.add(PANEL_ID, {
    title: '',
    type: types.TOOL,
    match: ({ viewMode }) => viewMode === 'story',
    render: () => <VisionSimulator />,
  });

  addons.add(PANEL_ID, {
    title: Title,
    type: types.PANEL,
    render: ({ active = true }) => (
      <A11yContextProvider active={active}>
        <A11YPanel />
      </A11yContextProvider>
    ),
    paramKey: PARAM_KEY,
  });
});
