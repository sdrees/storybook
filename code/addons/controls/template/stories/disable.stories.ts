import { global as globalThis } from '@storybook/global';
import type { PartialStoryFn, StoryContext } from '@storybook/types';

export default {
  component: null,
  decorators: [
    (storyFn: PartialStoryFn, context: StoryContext) =>
      storyFn({ component: globalThis.Components.Pre, args: { object: context.args } }),
  ],
};

export const DisableTable = {
  args: { a: 'a', b: 'b' },
  argTypes: {
    b: { table: { disable: true } },
  },
};

export const DisableControl = {
  args: { a: 'a', b: 'b' },
  argTypes: {
    b: { control: { disable: true } },
  },
};
