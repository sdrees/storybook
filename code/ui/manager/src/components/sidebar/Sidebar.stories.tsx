import React from 'react';

import { Sidebar, DEFAULT_REF_ID } from './Sidebar';
import { standardData as standardHeaderData } from './Heading.stories';
import * as ExplorerStories from './Explorer.stories';
import { mockDataset } from './mockdata';
import type { RefType } from './types';

export default {
  component: Sidebar,
  title: 'Sidebar/Sidebar',
  excludeStories: /.*Data$/,
  parameters: { layout: 'fullscreen' },
  decorators: [
    ExplorerStories.default.decorators[0],
    (storyFn: any) => <div style={{ padding: '0 20px', maxWidth: '230px' }}>{storyFn()}</div>,
  ],
};

const { menu } = standardHeaderData;
const stories = mockDataset.withRoot;
const refId = DEFAULT_REF_ID;
const storyId = 'root-1-child-a2--grandchild-a1-1';

export const simpleData = { menu, stories, storyId };
export const loadingData = { menu, stories: {} };

const refs: Record<string, RefType> = {
  optimized: {
    id: 'optimized',
    title: 'This is a ref',
    url: 'https://example.com',
    ready: false,
    type: 'lazy',
    // @ts-expect-error (needs to be converted to CSF3)
    stories,
  },
};

export const Simple = () => (
  <Sidebar
    storiesConfigured
    menu={menu}
    stories={stories as any}
    storyId={storyId}
    refId={refId}
    refs={{}}
  />
);

export const Loading = () => (
  <Sidebar
    storiesConfigured={false}
    menu={menu}
    stories={{}}
    storyId={storyId}
    refId={refId}
    refs={{}}
  />
);

export const Empty = () => (
  <Sidebar storiesConfigured menu={menu} stories={{}} storyId={storyId} refId={refId} refs={{}} />
);

export const WithRefs = () => (
  <Sidebar
    storiesConfigured
    menu={menu}
    stories={stories as any}
    storyId={storyId}
    refId={refId}
    refs={refs}
  />
);

export const LoadingWithRefs = () => (
  <Sidebar
    storiesConfigured={false}
    menu={menu}
    stories={stories as any}
    storyId={storyId}
    refId={refId}
    refs={refs}
  />
);
