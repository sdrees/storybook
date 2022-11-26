import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Canvas } from './Canvas';
import { Story as StoryComponent } from './Story';
import * as BooleanStories from '../controls/Boolean.stories';

const meta: Meta<typeof Canvas> = {
  component: Canvas,
  parameters: {
    relativeCsfPaths: ['../controls/Boolean.stories'],
  },
  render: (args) => {
    return (
      <Canvas {...args}>
        <StoryComponent of={BooleanStories.Undefined} />
      </Canvas>
    );
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const BasicStory: Story = {};

export const WithSourceOpen: Story = {
  args: {
    withSource: 'open',
  },
};
export const WithSourceClosed: Story = {
  args: {
    withSource: 'closed',
  },
};

// TODO: what is the purpose of mdxSource exactly?
export const WithMdxSource: Story = {
  name: 'With MDX Source',
  args: {
    withSource: 'open',
    mdxSource: `const thisIsCustomSource = true;
if (isSyntaxHighlighted) {
  console.log('syntax highlighting is working');
}`,
  },
};

export const WithoutSource: Story = {
  args: {
    withSource: 'none',
  },
};

export const WithToolbar: Story = {
  args: {
    withToolbar: true,
  },
};
export const WithAdditionalActions: Story = {
  args: {
    additionalActions: [
      {
        title: 'Open in GitHub',
        onClick: () => {
          window.open(
            'https://github.com/storybookjs/storybook/blob/next/code/ui/blocks/src/controls/Boolean.stories.tsx',
            '_blank'
          );
        },
      },
      {
        title: 'Go to documentation',
        onClick: () => {
          window.open(
            'https://storybook.js.org/docs/react/essentials/controls#annotation',
            '_blank'
          );
        },
      },
    ],
  },
};
