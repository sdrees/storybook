import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Canvas, SourceState } from './Canvas';
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
    withSource: SourceState.OPEN,
  },
};
export const WithSourceClosed: Story = {
  args: {
    withSource: SourceState.CLOSED,
  },
};

// TODO: what is the purpose of mdxSource exactly?
export const WithMdxSource: Story = {
  name: 'With MDX Source',
  args: {
    withSource: SourceState.OPEN,
    mdxSource: `const thisIsCustomSource = true;
if (isSyntaxHighlighted) {
  console.log('syntax highlighting is working');
}`,
  },
};

export const WithoutSource: Story = {
  args: {
    withSource: SourceState.NONE,
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

const ClassNameStoryDescripition = () => (
  <p>
    This story sets the <code>className</code> prop on the <code>Canvas</code> to{' '}
    <code>my-custom-classname</code>, which will propagate to the preview element. To demonstrate
    this, it also adds a <code>style</code> tag that sets another background color for that class:
  </p>
);
/**
 * This is a comment on classname
 */
export const ClassName: Story = {
  name: 'ClassName',
  args: {
    className: 'my-custom-classname',
  },
  render: (args) => (
    <>
      <ClassNameStoryDescripition />
      <style>
        {`
          .my-custom-classname {
            background-color: #fd5c9355;
          }
        `}
      </style>
      <Canvas {...args}>
        <StoryComponent of={BooleanStories.Undefined} />
      </Canvas>
    </>
  ),
};
