import globalThis from 'global';
import type { PartialStoryFn, StoryContext } from '@storybook/types';

export default {
  component: null,
  decorators: [
    (storyFn: PartialStoryFn, context: StoryContext) =>
      storyFn({ component: globalThis.Components.Pre, args: { object: context.args } }),
  ],
};

export const CustomMatchers = {
  parameters: {
    controls: {
      matchers: {
        date: /whateverIwant/,
      },
    },
    docs: { source: { state: 'open' } },
  },
  args: {
    whateverIwant: '10/10/2020',
  },
};

export const DisabledMatchers = {
  parameters: {
    controls: {
      matchers: {
        date: null,
        color: null,
      },
    },
  },
  args: {
    purchaseDate: '10/10/2020',
    backgroundColor: '#BADA55',
  },
};
