import type { Meta, StoryObj } from '@storybook/react';

import { Story as StoryComponent } from './Story';
import * as BooleanStories from '../controls/Boolean.stories';

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
  parameters: {
    relativeCsfPaths: ['../controls/Boolean.stories'],
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const BasicOf: Story = {
  args: {
    of: BooleanStories.Undefined,
  },
};
