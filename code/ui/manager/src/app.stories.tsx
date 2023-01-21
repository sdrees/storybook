import React from 'react';

import type { API } from '@storybook/manager-api';
import { Consumer, Provider as ManagerProvider } from '@storybook/manager-api';
import { LocationProvider } from '@storybook/router';
import { HelmetProvider } from 'react-helmet-async';
import { styled } from '@storybook/theming';
import App from './app';
import { PrettyFakeProvider, FakeProvider } from './FakeProvider';

export default {
  component: App,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (StoryFn: any) => (
      <HelmetProvider key="helmet.Provider">
        <LocationProvider>
          <ThemeStack>
            <StoryFn />
          </ThemeStack>
        </LocationProvider>
      </HelmetProvider>
    ),
  ],
};

const ThemeStack = styled.div(
  {
    position: 'relative',
    minHeight: '50vh',
    height: '100%',
  },
  ({ theme }) => ({
    background: theme.background.app,
    color: theme.color.defaultText,
  })
);

function setPreviewInitialized({ api }: { api: API }) {
  api.setPreviewInitialized();
  return {};
}

export const Default = () => {
  const provider = new FakeProvider();
  return (
    <ManagerProvider
      key="manager"
      provider={provider}
      path="/story/ui-app--loading-state"
      storyId="ui-app--loading-state"
      location={{ search: '' }}
      navigate={() => {}}
      docsOptions={{ docsMode: false }}
    >
      <Consumer filter={setPreviewInitialized}>{() => <></>}</Consumer>
      <App
        key="app"
        viewMode="story"
        layout={{
          initialActive: 'addons',
          isFullscreen: false,
          showToolbar: true,
          panelPosition: 'right',
          showNav: true,
          showPanel: true,
          showTabs: true,
        }}
        panelCount={0}
      />
    </ManagerProvider>
  );
};

export const LoadingState = () => (
  <ManagerProvider
    key="manager"
    provider={new PrettyFakeProvider()}
    path=""
    storyId="ui-app--loading-state"
    location={{ search: '' }}
    navigate={() => {}}
    docsOptions={{ docsMode: false }}
  >
    <App
      key="app"
      viewMode="story"
      layout={{
        initialActive: 'addons',
        isFullscreen: false,
        showToolbar: true,
        panelPosition: 'right',
        showNav: true,
        showPanel: true,
        showTabs: true,
      }}
      panelCount={0}
    />
  </ManagerProvider>
);
