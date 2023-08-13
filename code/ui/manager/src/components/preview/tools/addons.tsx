import React from 'react';
import { IconButton } from '@storybook/components';
import { Icon } from '@storybook/components/experimental';
import { Consumer, types } from '@storybook/manager-api';
import type { Combo } from '@storybook/manager-api';
import type { Addon_BaseType } from '@storybook/types';

const menuMapper = ({ api, state }: Combo) => ({
  isVisible: state.layout.showPanel,
  singleStory: state.singleStory,
  panelPosition: state.layout.panelPosition,
  toggle: () => api.togglePanel(),
});

export const addonsTool: Addon_BaseType = {
  title: 'addons',
  id: 'addons',
  type: types.TOOL,
  match: ({ viewMode }) => viewMode === 'story',
  render: () => (
    <Consumer filter={menuMapper}>
      {({ isVisible, toggle, singleStory, panelPosition }) =>
        !singleStory &&
        !isVisible && (
          <>
            <IconButton aria-label="Show addons" key="addons" onClick={toggle} title="Show addons">
              {panelPosition === 'bottom' ? <Icon.BottomBar /> : <Icon.SidebarAlt />}
            </IconButton>
          </>
        )
      }
    </Consumer>
  ),
};
