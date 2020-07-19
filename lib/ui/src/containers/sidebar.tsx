import React, { FunctionComponent } from 'react';

import { Consumer, Combo, StoriesHash } from '@storybook/api';

import SidebarComponent from '../components/sidebar/Sidebar';
import { useMenu } from './menu';

export type Item = StoriesHash[keyof StoriesHash];

const Sidebar: FunctionComponent<{}> = React.memo(() => {
  const mapper = ({ state, api }: Combo) => {
    const {
      ui: { name, url, enableShortcuts },
      viewMode,
      storyId,
      layout: { isFullscreen, showPanel, showNav },
      storiesHash,
      storiesConfigured,
      storiesFailed,
      refs,
    } = state;

    const menu = useMenu(api, isFullscreen, showPanel, showNav, enableShortcuts);

    return {
      title: name,
      url,
      stories: storiesHash,
      storiesFailed,
      storiesConfigured,
      refs,
      storyId,
      viewMode,
      menu,
      menuHighlighted: api.versionUpdateAvailable(),
    };
  };
  return (
    <Consumer filter={mapper}>
      {(fromState) => {
        return <SidebarComponent {...fromState} />;
      }}
    </Consumer>
  );
});

export default Sidebar;
