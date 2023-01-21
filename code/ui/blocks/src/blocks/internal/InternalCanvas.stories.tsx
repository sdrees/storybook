/// <reference types="@types/jest" />;
/// <reference types="@testing-library/jest-dom" />;
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { Canvas } from '../Canvas';
import { Story as StoryComponent } from '../Story';
import * as ButtonStories from '../../examples/Button.stories';

const meta: Meta<typeof Canvas> = {
  title: 'Blocks/Internal/Canvas',
  component: Canvas,
  parameters: {
    theme: 'light',
    relativeCsfPaths: ['../examples/Button.stories'],
  },
  render: (args) => {
    return (
      <Canvas {...args}>
        <StoryComponent of={ButtonStories.Primary} />
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
    const showCodeButton = await canvas.findByText('Show code');
    await expect(showCodeButton).toBeInTheDocument();

    // Act - click button to show code
    await userEvent.click(showCodeButton);

    // Assert - check that the correct amount of stories' source is shown
    const booleanControlNodes = await canvas.findAllByText(`label`);
    await expect(booleanControlNodes).toHaveLength(amount);
  };

export const MultipleChildren: Story = {
  render: (args) => {
    return (
      <Canvas {...args}>
        <StoryComponent of={ButtonStories.Secondary} />
        <StoryComponent of={ButtonStories.Large} />
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
        <StoryComponent of={ButtonStories.Secondary} />
        <StoryComponent of={ButtonStories.Large} />
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
        <StoryComponent of={ButtonStories.Secondary} />
        <StoryComponent of={ButtonStories.Secondary} />
        <StoryComponent of={ButtonStories.Secondary} />
        <StoryComponent of={ButtonStories.Large} />
        <StoryComponent of={ButtonStories.Large} />
        <StoryComponent of={ButtonStories.Large} />
        <StoryComponent of={ButtonStories.Primary} />
        <StoryComponent of={ButtonStories.Primary} />
        <StoryComponent of={ButtonStories.Primary} />
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
        <h1>Headline for secondary Button</h1>
        <StoryComponent of={ButtonStories.Secondary} />
        <h1>Headline for primary Button</h1>
        <StoryComponent of={ButtonStories.Primary} />
      </Canvas>
    );
  },
  play: async (args) => {
    // this function will also expand the source code
    await expectAmountOfStoriesInSource(2)(args);
    const canvas = within(args.canvasElement);

    // Assert - only find two headlines, those in the story, and none in the source code
    expect(canvas.queryAllByText(/Headline for /i)).toHaveLength(2);
  },
};
