import type { Meta, StoryObj } from '@storybook/react';
import { BooleanControl } from './Boolean';

const meta = {
  component: BooleanControl,
  tags: ['docsPage'],
  parameters: { withRawArg: 'value', controls: { include: ['value'] } },
  args: { name: 'boolean' },
} as Meta<typeof BooleanControl>;

export default meta;

export const True: StoryObj<typeof BooleanControl> = {
  args: {
    value: true,
  },
};
export const False: StoryObj<typeof BooleanControl> = {
  args: {
    value: false,
  },
};

export const Undefined: StoryObj<typeof BooleanControl> = {
  args: {
    value: undefined,
  },
};
