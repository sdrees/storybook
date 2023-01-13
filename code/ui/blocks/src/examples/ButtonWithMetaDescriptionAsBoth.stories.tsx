import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

/**
 * These are the stories for the Button component
 *
 * _this description was written as a comment above the default export_
 * _this should never be shown in Storybook, as it should be overridden by `parameters.docs.description.component`_
 */
const meta = {
  title: 'Blocks/Description/Button',
  component: Button,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
  parameters: {
    docs: {
      description: {
        component: `
These are the stories for the Button component

_this description was written as a string in \`parameters.docs.description.component\` and should override the comment above the default export_
   `,
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithMetaDescriptionAsBoth: Story = {
  args: {
    primary: true,
    label: 'Button',
  },
};
