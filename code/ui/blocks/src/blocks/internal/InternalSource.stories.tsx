import type { Meta, StoryObj } from '@storybook/react';

import { Source } from '../Source';

const meta: Meta<typeof Source> = {
  component: Source,
  parameters: {
    relativeCsfPaths: ['../examples/Button.stories'],
    attached: false,
    docsStyles: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Id: Story = {
  args: {
    id: 'storybook-blocks-examples-button--primary',
  },
};

export const Ids: Story = {
  args: {
    ids: [
      'storybook-blocks-examples-button--primary',
      'storybook-blocks-examples-button--secondary',
    ],
  },
};
