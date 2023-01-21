/// <reference types="vite/client" />
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Story as StoryBlock } from './Story';
import * as ButtonStories from '../examples/Button.stories';
import * as StoryComponentStories from '../components/Story.stories';

const meta: Meta<typeof StoryBlock> = {
  component: StoryBlock,
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
}example-button--primary`;

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
          height: '500px',
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
          It has a fixed <code>height</code> of <code>500px</code> and a fixed <code>width</code> of{' '}
          <code>800px</code>
        </p>
      </div>
    );
  },
  parameters: {
    // Stop *this* story from being stacked in Chromatic
    theme: 'default',
  },
};

export const Inline: Story = {
  args: {
    of: SimpleSizeTest,
    inline: true,
  },
};

export const InlineWithHeightProps: Story = {
  ...Inline,
  args: {
    of: SimpleSizeTest,
    inline: true,
    height: '600px',
  },
};

export const SimpleSizeTestWithHeightParameter = {
  ...SimpleSizeTest,
  parameters: {
    docs: { story: { height: '600px' } },
    // Stop *this* story from being stacked in Chromatic
    theme: 'default',
  },
};

export const InlineWithHeightParameter: Story = {
  ...Inline,
  args: {
    of: SimpleSizeTestWithHeightParameter,
  },
};

export const IFrameProps: Story = {
  ...Inline,
  name: 'IFrame Props',
  args: {
    of: SimpleSizeTest,
    inline: false,
  },
};

export const SimpleSizeTestWithIFrameParameter = {
  ...SimpleSizeTest,
  parameters: { docs: { story: { inline: false } } },
};

export const IframeWithParameter: Story = {
  ...Inline,
  name: 'IFrame With Parameter',
  args: {
    of: SimpleSizeTestWithIFrameParameter,
  },
};

export const IframeWithHeightProps: Story = {
  ...Inline,
  name: 'IFrame With Height Props',
  args: {
    of: SimpleSizeTest,
    inline: false,
    height: '300px',
  },
};

export const SimpleSizeTestWithIFrameAndIFrameHeightParameter = {
  ...SimpleSizeTest,
  parameters: {
    docs: { story: { inline: false, iframeHeight: '300px' } },
    // Stop *this* story from being stacked in Chromatic
    theme: 'default',
  },
};

export const IFrameWithIFrameHeightParameter: Story = {
  ...Inline,
  name: 'IFrame With IFrame Height Parameter',
  args: {
    of: SimpleSizeTestWithIFrameAndIFrameHeightParameter,
  },
};

export const SimpleSizeTestWithIFrameAndHeightParameter = {
  ...SimpleSizeTest,
  parameters: {
    docs: { story: { inline: false, height: '300px' } },
    // Stop *this* story from being stacked in Chromatic
    theme: 'default',
  },
};

export const IFrameWithHeightParameter: Story = {
  ...Inline,
  name: 'IFrame With Height Parameter',
  args: {
    of: SimpleSizeTestWithIFrameAndHeightParameter,
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

export const WithInteractionsAutoplayInProps: Story = {
  args: {
    of: ButtonStories.Clicking,
    autoplay: true,
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

export const ForceInitialArgs: Story = {
  ...StoryComponentStories.ForceInitialArgs,
  args: {
    of: ButtonStories.Primary,
    storyExport: ButtonStories.Primary,
    __forceInitialArgs: true,
  } as any,
};
