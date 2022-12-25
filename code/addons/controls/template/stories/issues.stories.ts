import { global as globalThis } from '@storybook/global';
import type { PartialStoryFn, StoryContext } from '@storybook/types';

export default {
  component: null,
  decorators: [
    (storyFn: PartialStoryFn, context: StoryContext) =>
      storyFn({ component: globalThis.Components.Pre, args: { object: context.args } }),
  ],
};

// https://github.com/storybookjs/storybook/issues/14752
export const MissingRadioOptions = {
  argTypes: { invalidRadio: { control: 'radio' } },
  args: { invalidRadio: 'someValue' },
};
