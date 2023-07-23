import type { Meta, StoryObj } from '@storybook/react';

import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Input',
  component: Input,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Base: Story = {
  args: {
    placeholder: 'Hello World',
  },
};

export const Filled: Story = {
  args: {
    ...Base.args,
    value: 'Hello World',
  },
};

export const Disabled: Story = {
  args: {
    ...Base.args,
    disabled: true,
  },
};
