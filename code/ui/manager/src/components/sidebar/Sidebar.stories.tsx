import React from 'react';

import type { IndexHash } from 'lib/manager-api/src';
import { Sidebar, DEFAULT_REF_ID } from './Sidebar';
import { standardData as standardHeaderData } from './Heading.stories';
import * as ExplorerStories from './Explorer.stories';
import { mockDataset } from './mockdata';
import type { RefType } from './types';

export default {
  component: Sidebar,
  title: 'Sidebar/Sidebar',
  excludeStories: /.*Data$/,
  parameters: { layout: 'fullscreen', withSymbols: true },
  decorators: [
    ExplorerStories.default.decorators[0],
    (storyFn: any) => <div style={{ padding: '0 20px', maxWidth: '230px' }}>{storyFn()}</div>,
  ],
};

const { menu } = standardHeaderData;
const index = mockDataset.withRoot as IndexHash;
const refId = DEFAULT_REF_ID;
const storyId = 'root-1-child-a2--grandchild-a1-1';

export const simpleData = { menu, index, storyId };
export const loadingData = { menu };

const refs: Record<string, RefType> = {
  optimized: {
    id: 'optimized',
    title: 'This is a ref',
    url: 'https://example.com',
    type: 'lazy',
    index,
    previewInitialized: true,
  },
};

const indexError = new Error('Failed to load index');

const refsError = {
  optimized: {
    ...refs.optimized,
    index: undefined as IndexHash,
    indexError,
  },
};

export const Simple = () => (
  <Sidebar
    previewInitialized
    menu={menu}
    index={index as any}
    storyId={storyId}
    refId={refId}
    refs={{}}
  />
);

export const Loading = () => (
  <Sidebar previewInitialized={false} menu={menu} storyId={storyId} refId={refId} refs={{}} />
);

export const Empty = () => (
  <Sidebar previewInitialized menu={menu} index={{}} storyId={storyId} refId={refId} refs={{}} />
);

export const IndexError = () => (
  <Sidebar
    previewInitialized
    indexError={indexError}
    menu={menu}
    storyId={storyId}
    refId={refId}
    refs={{}}
  />
);

export const WithRefs = () => (
  <Sidebar
    previewInitialized
    menu={menu}
    index={index as any}
    storyId={storyId}
    refId={refId}
    refs={refs}
  />
);

export const LoadingWithRefs = () => (
  <Sidebar previewInitialized={false} menu={menu} storyId={storyId} refId={refId} refs={refs} />
);

export const LoadingWithRefError = () => (
  <Sidebar
    previewInitialized={false}
    menu={menu}
    storyId={storyId}
    refId={refId}
    refs={refsError}
  />
);
