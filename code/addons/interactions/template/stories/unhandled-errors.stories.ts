import { global as globalThis } from '@storybook/global';
import { userEvent, within } from '@storybook/test';

export default {
  component: globalThis.Components.Button,
  args: {
    label: 'Button',
  },
  argTypes: {
    onClick: { type: 'function' },
  },
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
  },
};

export const Default = {
  play: async (context) => {
    const { args, canvasElement } = context;
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
  },
};
