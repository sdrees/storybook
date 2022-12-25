import { global as globalThis } from '@storybook/global';

export default {
  component: globalThis.Components.Button,
  tags: ['autodocs'],
  args: { label: 'Rendered in iframe' },
  parameters: {
    chromatic: { disable: true },
    docs: { iframeHeight: 120, inlineStories: true },
  },
};

export const Basic = {};
