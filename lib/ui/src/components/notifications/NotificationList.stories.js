import React from 'react';
import { LocationProvider } from '@storybook/router';

import NotificationList from './NotificationList';
import itemMeta, * as itemStories from './NotificationItem.stories';

export default {
  component: NotificationList,
  title: 'UI/Notifications/NotificationList',
  decorators: [
    (StoryFn) => (
      <LocationProvider>
        <StoryFn />
      </LocationProvider>
    ),

    (storyFn) => (
      <div style={{ width: '240px', margin: '1rem', position: 'relative', height: '100%' }}>
        {storyFn()}
      </div>
    ),
  ],
  excludeStories: /.*Data$/,
};

const items = Array.from(Object.entries(itemStories))
  .filter((entry) => itemMeta.excludeStories.exec(entry[0]))
  .map((entry) => entry[1]);

export const singleData = [items[0]];
export const allData = items;

function clearNotification(id) {}

export const Single = () => (
  <NotificationList
    notifications={singleData}
    clearNotification={clearNotification}
    placement={{ position: 'relative' }}
  />
);

export const All = () => (
  <NotificationList
    notifications={allData}
    clearNotification={clearNotification}
    placement={{ position: 'relative' }}
  />
);

export const Placement = () => (
  // Note: position:absolute is only for QA/testing. Use position:fixed when integrating into the real UI.
  <NotificationList
    placement={{ position: 'absolute', left: 20, bottom: 20 }}
    clearNotification={clearNotification}
    notifications={allData}
  />
);
