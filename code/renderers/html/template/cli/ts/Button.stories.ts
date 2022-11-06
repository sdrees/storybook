import type { StoryObj, Meta } from '@storybook/html';
import type { ButtonProps } from './Button';
import { createButton } from './Button';

// More on how to set up stories at: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
const meta: Meta<ButtonProps> = {
  title: 'Example/Button',
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/html/writing-docs/docs-page
  tags: ['docsPage'],
  render: (args) => {
    // You can either use a function to create DOM elements or use a plain html string!
    // return `<div>${label}</div>`;
    return createButton(args);
  },
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
    label: { control: 'text' },
    onClick: { action: 'onClick' },
    primary: { control: 'boolean' },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<ButtonProps>;

// More on component templates: https://storybook.js.org/docs/html/writing-stories/introduction#using-args
export const Primary: Story = {
  args: {
    primary: true,
    label: 'Button',
  },
};

export const Secondary: Story = {
  args: {
    label: 'Button',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    label: 'Button',
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    label: 'Button',
  },
};
