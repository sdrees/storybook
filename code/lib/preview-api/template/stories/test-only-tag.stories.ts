import { global as globalThis } from '@storybook/global';

export default {
  component: globalThis.Components.Button,
  tags: ['autodocs', 'test-only'],
  parameters: { chromatic: { disable: true } },
};

export const Default = {
  args: { label: 'Button' },
};
