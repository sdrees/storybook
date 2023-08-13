import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Base = {
  args: { children: 'Button' },
};

export const Variants: Story = {
  args: {
    ...Base.args,
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Button variant="solid">Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};

export const Active: Story = {
  args: {
    ...Base.args,
  },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Button variant="solid" active {...args}>
        Solid
      </Button>
      <Button variant="outline" active {...args}>
        Outline
      </Button>
      <Button variant="ghost" active {...args}>
        Ghost
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  args: {
    ...Base.args,
    icon: 'FaceHappy',
  },
  render: ({ icon, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Button variant="solid" icon={icon}>
        {children}
      </Button>
      <Button variant="outline" icon={icon}>
        {children}
      </Button>
      <Button variant="ghost" icon={icon}>
        {children}
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  args: {
    ...Base.args,
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Button size="small" icon="FaceHappy">
        Small Button
      </Button>
      <Button size="medium" icon="FaceHappy">
        Medium Button
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    ...Base.args,
    disabled: true,
    children: 'Disabled Button',
  },
};

export const WithHref: Story = {
  args: {
    ...Base.args,
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Button onClick={() => console.log('Hello')}>I am a button using onClick</Button>
      <Button as="a" href="https://storybook.js.org/">
        I am an anchor using Href
      </Button>
    </div>
  ),
};
