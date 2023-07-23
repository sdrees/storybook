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
      status,
      indexError,
      previewInitialized,
      refs,
    } = state;

    const menu = useMenu(
      state,
      api,
      showToolbar,
      isFullscreen,
      showPanel,
      showNav,
      enableShortcuts
    );

    const whatsNewNotificationsEnabled =
      state.whatsNewData?.status === 'SUCCESS' && !state.disableWhatsNewNotifications;

    return {
      title: name,
      url,
      index,
      indexError,
      status,
      previewInitialized,
      refs,
      storyId,
      refId,
      viewMode,
      menu,
      menuHighlighted: whatsNewNotificationsEnabled && api.isWhatsNewUnread(),
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
