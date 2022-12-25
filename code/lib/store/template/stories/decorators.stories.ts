import { global as globalThis } from '@storybook/global';
import type { PartialStoryFn, PlayFunctionContext, StoryContext } from '@storybook/types';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

export default {
  component: globalThis.Components.Pre,
  parameters: { useProjectDecorator: true },
  decorators: [
    (storyFn: PartialStoryFn, context: StoryContext) =>
      storyFn({ args: { ...context.args, text: `component ${context.args.text}` } }),
  ],
};

export const Inheritance = {
  decorators: [
    (storyFn: PartialStoryFn, context: StoryContext) =>
      storyFn({ args: { ...context.args, text: `story ${context.args.text}` } }),
  ],
  args: {
    text: 'starting',
  },
  play: async ({ canvasElement }: PlayFunctionContext) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('pre').innerText).toEqual('story component project starting');
  },
};
