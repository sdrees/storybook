import type { FC } from 'react';
import React, { useMemo } from 'react';
import { useResizeDetector } from 'react-resize-detector';

import { type State } from '@storybook/manager-api';
import { Symbols } from '@storybook/components';
import { Route } from '@storybook/router';
import { Global, createGlobal, styled } from '@storybook/theming';

import { Mobile } from './components/layout/mobile';
import { Desktop } from './components/layout/desktop';
import Sidebar from './containers/sidebar';
import Preview from './containers/preview';
import Panel from './containers/panel';
import Notifications from './containers/notifications';

import SettingsPages from './settings';

const View = styled.div({
  position: 'fixed',
  overflow: 'hidden',
  height: '100vh',
  width: '100vw',
});

export interface AppProps {
  viewMode: State['viewMode'];
  layout: State['layout'];
  panelCount: number;
}

const App: React.FC<AppProps> = ({ viewMode, layout, panelCount }) => {
  const { width, height, ref } = useResizeDetector();
  let content;

  const props = useMemo(
    () => ({
      Sidebar,
      Preview,
      Panel,
      Notifications,
      pages: [
        {
          key: 'settings',
          render: () => <SettingsPages />,
          route: (({ children }) => (
            <Route path="/settings/" startsWith>
              {children}
            </Route>
          )) as FC,
        },
      ],
    }),
    []
  );

  if (!width || !height) {
    content = <div />;
  } else if (width < 600) {
    content = <Mobile {...props} viewMode={viewMode} options={layout} />;
  } else {
    content = (
      <Desktop
        {...props}
        viewMode={viewMode}
        options={layout}
        width={width}
        height={height}
        panelCount={panelCount}
      />
    );
  }

  return (
    <View ref={ref}>
      <Global styles={createGlobal} />
      <Symbols icons={['folder', 'component', 'document', 'bookmarkhollow']} />
      {content}
    </View>
  );
};

App.displayName = 'App';

export default App;
