// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./typings.d.ts" />

import global from 'global';
import React, { FC } from 'react';
import ReactDOM from 'react-dom';

import { Location, LocationProvider, useNavigate } from '@storybook/router';
import { Provider as ManagerProvider, Combo } from '@storybook/api';
import {
  ThemeProvider,
  ensure as ensureTheme,
  CacheProvider,
  createCache,
} from '@storybook/theming';
import { HelmetProvider } from 'react-helmet-async';

import App from './app';

import Provider from './provider';

const emotionCache = createCache({ key: 'sto' });
emotionCache.compat = true;

const { DOCS_MODE } = global;

// @ts-ignore
ThemeProvider.displayName = 'ThemeProvider';
// @ts-ignore
HelmetProvider.displayName = 'HelmetProvider';

const getDocsMode = () => {
  try {
    return !!DOCS_MODE;
  } catch (e) {
    return false;
  }
};

// @ts-ignore
const Container = process.env.XSTORYBOOK_EXAMPLE_APP ? React.StrictMode : React.Fragment;

export interface RootProps {
  provider: Provider;
  history?: History;
}

export const Root: FC<RootProps> = ({ provider }) => (
  <Container key="container">
    <HelmetProvider key="helmet.Provider">
      <LocationProvider key="location.provider">
        <Main provider={provider} />
      </LocationProvider>
    </HelmetProvider>
  </Container>
);

const Main: FC<{ provider: Provider }> = ({ provider }) => {
  const navigate = useNavigate();
  return (
    <Location key="location.consumer">
      {(locationData) => (
        <ManagerProvider
          key="manager"
          provider={provider}
          {...locationData}
          navigate={navigate}
          docsMode={getDocsMode()}
        >
          {({ state, api }: Combo) => {
            const panelCount = Object.keys(api.getPanels()).length;
            const story = api.getData(state.storyId, state.refId);
            const isLoading = story
              ? !!state.refs[state.refId] && !state.refs[state.refId].ready
              : !state.storiesFailed && !state.storiesConfigured;

            return (
              <CacheProvider value={emotionCache}>
                <ThemeProvider key="theme.provider" theme={ensureTheme(state.theme)}>
                  <App
                    key="app"
                    viewMode={state.viewMode}
                    layout={isLoading ? { ...state.layout, showPanel: false } : state.layout}
                    panelCount={panelCount}
                  />
                </ThemeProvider>
              </CacheProvider>
            );
          }}
        </ManagerProvider>
      )}
    </Location>
  );
};

export function renderStorybookUI(domNode: HTMLElement, provider: Provider) {
  if (!(provider instanceof Provider)) {
    throw new Error('provider is not extended from the base Provider');
  }

  ReactDOM.render(<Root key="root" provider={provider} />, domNode);
}

export { Provider };
