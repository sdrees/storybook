import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Toolbar } from './Toolbar';
import { IconButton } from '../IconButton/IconButton';
import { Button } from '../Button/Button';

const meta: Meta<typeof Toolbar.Root> = {
  title: 'Toolbar',
  component: Toolbar.Root,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Toolbar.Root>;

export const Base: Story = {
  args: {
    hasPadding: true,
    borderTop: false,
    borderBottom: true,
  },
  render: (_, { args }) => (
    <Toolbar.Root {...args}>
      <Toolbar.Left>
        <Toolbar.ToogleGroup type="single">
          <Toolbar.ToggleItem value="item1">
            <IconButton icon="Sync" size="small" variant="ghost" onClickAnimation="rotate360" />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="item2">
            <IconButton icon="Zoom" size="small" variant="ghost" />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="item2">
            <IconButton icon="ZoomOut" size="small" variant="ghost" />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="item2">
            <IconButton icon="ZoomReset" size="small" variant="ghost" />
          </Toolbar.ToggleItem>
        </Toolbar.ToogleGroup>
        <Toolbar.Separator />
        <Toolbar.ToogleGroup type="single">
          <Toolbar.ToggleItem value="item1">
            <IconButton icon="Photo" size="small" variant="ghost" />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="item2">
            <IconButton icon="Grid" size="small" variant="ghost" />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="item2">
            <IconButton icon="Grow" size="small" variant="ghost" />
          </Toolbar.ToggleItem>
        </Toolbar.ToogleGroup>
        <Toolbar.Separator />
        <Toolbar.ToogleGroup type="single">
          <Toolbar.ToggleItem value="item1">
            <Button icon="CircleHollow" size="small" variant="ghost">
              Theme
            </Button>
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="item2">
            <IconButton icon="Ruler" size="small" variant="ghost" />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="item2">
            <IconButton icon="Outline" size="small" variant="ghost" />
          </Toolbar.ToggleItem>
        </Toolbar.ToogleGroup>
      </Toolbar.Left>
      <Toolbar.Right>
        <Toolbar.ToogleGroup type="single">
          <Toolbar.ToggleItem value="item2">
            <IconButton icon="Expand" size="small" variant="ghost" />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="item2">
            <IconButton icon="ShareAlt" size="small" variant="ghost" />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="item2">
            <IconButton icon="Link" size="small" variant="ghost" />
          </Toolbar.ToggleItem>
        </Toolbar.ToogleGroup>
      </Toolbar.Right>
    </Toolbar.Root>
  ),
};

export const NoMargin: Story = {
  args: {
    ...Base.args,
    hasPadding: false,
  },
  render: Base.render,
};

export const BorderTop: Story = {
  args: {
    ...Base.args,
    borderTop: true,
    borderBottom: false,
  },
  render: Base.render,
};

export const BorderBottom: Story = {
  args: {
    ...Base.args,
    borderTop: false,
    borderBottom: true,
  },
  render: Base.render,
};

export const BorderTopBottom: Story = {
  args: {
    ...Base.args,
    borderTop: true,
    borderBottom: true,
  },
  render: Base.render,
};
