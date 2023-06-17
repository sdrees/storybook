import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { DocsPage } from './DocsPage';

const meta = {
  component: DocsPage,
  parameters: {
    docsStyles: true,
  },
} satisfies Meta<typeof DocsPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    relativeCsfPaths: ['../examples/Button.stories'],
  },
  play: async ({ canvasElement }) => {
    // This play function's sole purpose is to add a "chromatic ignore" region to a flaky row.
    const canvas = within(canvasElement);
    const sizeCell = await canvas.findByText('How large should the button be?');
    const sizeRow = sizeCell.parentElement?.parentElement?.parentElement;
    if (sizeRow?.nodeName === 'TR') {
      sizeRow.setAttribute('data-chromatic', 'ignore');
    } else {
      throw new Error('the DOM structure changed, please update this test');
    }
  },
};
export const SingleStory: Story = {
  ...Default,
  parameters: {
    relativeCsfPaths: ['../examples/DocsPageParameters.stories'],
  },
};
