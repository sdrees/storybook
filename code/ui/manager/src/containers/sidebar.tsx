import React from 'react';

import type { Combo, StoriesHash } from '@storybook/manager-api';
import { Consumer } from '@storybook/manager-api';

import { Sidebar as SidebarComponent } from '../components/sidebar/Sidebar';
import { useMenu } from './menu';

export type Item = StoriesHash[keyof StoriesHash];

const Sidebar = React.memo(function Sideber() {
  const mapper = ({ state, api }: Combo) => {
    const {
      ui: { name, url, enableShortcuts },
      viewMode,
      storyId,
      refId,
      layout: { showToolbar, isFullscreen, showPanel, showNav },
      index,
      indexError,
      previewInitialized,
      refs,
    } = state;

    const menu = useMenu(api, showToolbar, isFullscreen, showPanel, showNav, enableShortcuts);

    return {
      title: name,
      url,
      index,
      indexError,
      previewInitialized,
      refs,
      storyId,
      refId,
      viewMode,
      menu,
      menuHighlighted: api.versionUpdateAvailable(),
      enableShortcuts,
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
