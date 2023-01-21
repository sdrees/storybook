import type { Meta, StoryObj } from '@storybook/react';

import { Source } from '../Source';

const meta: Meta<typeof Source> = {
  title: 'Blocks/Internal/Source',
  component: Source,
  parameters: {
    relativeCsfPaths: ['../examples/Button.stories'],
    attached: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Id: Story = {
  args: {
    id: 'storybook-blocks-example-button--primary',
  },
};

export const Ids: Story = {
  args: {
    ids: ['storybook-blocks-example-button--primary', 'storybook-blocks-example-button--secondary'],
  },
};
