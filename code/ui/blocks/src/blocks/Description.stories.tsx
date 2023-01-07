import type { Meta, StoryObj } from '@storybook/react';
import { Description } from './Description';
import { Button } from '../examples/Button';

const meta: Meta<typeof Description> = {
  component: Description,
  parameters: {
    relativeCsfPaths: ['../examples/Button.stories'],
    controls: {
      include: [],
      hideNoControlsWarning: true,
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const ButtonComponent: Story = {
  args: {
    of: Button,
  },
};
