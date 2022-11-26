/// <reference types="@types/jest" />;
/// <reference types="@testing-library/jest-dom" />;
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, waitFor, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { Canvas } from '../Canvas';
import { Story as StoryComponent } from '../Story';
import * as BooleanStories from '../../controls/Boolean.stories';

const meta: Meta<typeof Canvas> = {
  title: 'Blocks/Internal/Canvas',
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

const expectAmountOfStoriesInSource =
  (amount: number): Story['play'] =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Arrange - find the "Show code" button
    let showCodeButton = canvas.getByText('Show code');
    await waitFor(() => {
      showCodeButton = canvas.getByText('Show code');
      expect(showCodeButton).toBeInTheDocument();
    });

    // Act - click button to show code
    await userEvent.click(showCodeButton);

    // Assert - check that the correct amount of stories' source is shown
    await waitFor(async () => {
      const booleanControlNodes = await canvas.findAllByText('BooleanControl');
      expect(booleanControlNodes).toHaveLength(amount);
    });
  };

export const MultipleChildren: Story = {
  render: (args) => {
    return (
      <Canvas {...args}>
        <StoryComponent of={BooleanStories.True} />
        <StoryComponent of={BooleanStories.False} />
      </Canvas>
    );
  },
  play: expectAmountOfStoriesInSource(2),
};

export const MultipleChildrenColumns: Story = {
  args: {
    isColumn: true,
  },
  render: (args) => {
    return (
      <Canvas {...args}>
        <StoryComponent of={BooleanStories.True} />
        <StoryComponent of={BooleanStories.False} />
      </Canvas>
    );
  },
  play: expectAmountOfStoriesInSource(2),
};

export const MultipleChildrenThreeColumns: Story = {
  args: {
    columns: 3,
  },
  render: (args) => {
    return (
      <Canvas {...args}>
        <StoryComponent of={BooleanStories.True} />
        <StoryComponent of={BooleanStories.True} />
        <StoryComponent of={BooleanStories.True} />
        <StoryComponent of={BooleanStories.False} />
        <StoryComponent of={BooleanStories.False} />
        <StoryComponent of={BooleanStories.False} />
        <StoryComponent of={BooleanStories.Undefined} />
        <StoryComponent of={BooleanStories.Undefined} />
        <StoryComponent of={BooleanStories.Undefined} />
      </Canvas>
    );
  },
  play: expectAmountOfStoriesInSource(9),
};

export const MixedChildrenStories: Story = {
  args: { isColumn: true },
  render: (args) => {
    return (
      <Canvas {...args}>
        <h1>Headline for Boolean Controls true</h1>
        <StoryComponent of={BooleanStories.True} />
        <h1>Headline for Boolean Controls undefined</h1>
        <StoryComponent of={BooleanStories.Undefined} />
      </Canvas>
    );
  },
  play: async (args) => {
    // this function will also expand the source code
    await expectAmountOfStoriesInSource(2)(args);
    const canvas = within(args.canvasElement);

    // Assert - only find two headlines, those in the story, and none in the source code
    expect(canvas.queryAllByText(/Headline for Boolean Controls/i)).toHaveLength(2);
  },
};
