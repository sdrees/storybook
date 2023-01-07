/// <reference types="vite/client" />
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Story as StoryComponent } from './Story';
import * as ButtonStories from '../examples/Button.stories';

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
  parameters: {
    relativeCsfPaths: ['../examples/Button.stories', '../blocks/Story.stories'],
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Of: Story = {
  args: {
    of: ButtonStories.Primary,
  },
};

export const OfWithMeta: Story = {
  args: {
    of: ButtonStories.Secondary,
    meta: ButtonStories.default,
  },
};

const blocksAwareId = `${
  import.meta.env.STORYBOOK_BLOCKS_ONLY === 'true' ? '' : 'storybook-blocks-'
}controls-boolean--false`;

export const Id: Story = {
  args: {
    id: blocksAwareId,
  },
};

export const Name: Story = {
  args: {
    name: 'Secondary',
  },
};

export const SimpleSizeTest: Story = {
  render: () => {
    return (
      <div
        style={{
          background: '#fd5c9355',
          padding: '3rem',
          height: '1000px',
          width: '800px',
          // a global decorator is applying a default padding that we want to negate here
          margin: '-4rem -20px',
        }}
      >
        <p>
          This story does nothing. Its only purpose is to show how its size renders in different
          conditions (inline/iframe/fixed height) when used in a <code>{'<Story />'}</code> block.
        </p>
        <p>
          It has a fixed <code>height</code> of <code>1000px</code> and a fixed <code>width</code>{' '}
          of <code>800px</code>
        </p>
      </div>
    );
  },
};

export const Inline: Story = {
  args: {
    of: SimpleSizeTest,
    inline: true,
  },
};
export const InlineWithHeight: Story = {
  ...Inline,
  args: {
    of: SimpleSizeTest,
    inline: true,
    height: '300px',
  },
};
export const Iframe: Story = {
  ...Inline,
  args: {
    of: SimpleSizeTest,
    inline: false,
  },
};
export const IframeWithHeight: Story = {
  ...Inline,
  args: {
    of: SimpleSizeTest,
    inline: false,
    height: '300px',
  },
};

export const WithDefaultInteractions: Story = {
  args: {
    of: ButtonStories.Clicking,
  },
  parameters: {
    chromatic: { delay: 500 },
  },
};
export const WithInteractionsAutoplayInStory: Story = {
  args: {
    of: ButtonStories.ClickingInDocs,
  },
  parameters: {
    chromatic: { delay: 500 },
  },
};
