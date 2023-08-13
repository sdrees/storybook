import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { IconButton } from './IconButton';

const meta: Meta<typeof IconButton> = {
  title: 'IconButton',
  component: IconButton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Base = {
  args: { icon: 'FaceHappy' },
};

export const Types: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <IconButton variant="solid" icon="FaceHappy" />
      <IconButton variant="outline" icon="FaceHappy" />
      <IconButton variant="ghost" icon="FaceHappy" />
    </div>
  ),
};

export const Active: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <IconButton variant="solid" icon="FaceHappy" active />
      <IconButton variant="outline" icon="FaceHappy" active />
      <IconButton variant="ghost" icon="FaceHappy" active />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <IconButton size="small" icon="FaceHappy" />
      <IconButton size="medium" icon="FaceHappy" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    ...Base.args,
    icon: 'FaceHappy',
    disabled: true,
  },
};

export const Animated: Story = {
  args: {
    ...Base.args,
    icon: 'FaceHappy',
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <IconButton icon="FaceHappy" onClickAnimation="glow" />
      <IconButton icon="FaceHappy" onClickAnimation="rotate360" />
      <IconButton icon="FaceHappy" onClickAnimation="jiggle" />
    </div>
  ),
};

export const WithHref: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <IconButton icon="FaceHappy" onClick={() => console.log('Hello')} />
      <IconButton as="a" href="https://storybook.js.org/" icon="FaceHappy" />
    </div>
  ),
};
