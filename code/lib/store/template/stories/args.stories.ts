import { global as globalThis } from '@storybook/global';
import type { PartialStoryFn, PlayFunctionContext, StoryContext } from '@storybook/types';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { pick } from 'lodash';

export default {
  component: globalThis.Components.Pre,
  args: {
    componentArg: 'componentArg',
    storyArg: 'componentStoryArg',
    object: {
      a: 'component',
      b: 'component',
    },
  },
  // Compose the set of  args into `object`, so the pre component only needs a single prop
  //   (selecting only the args specified on parameters.argNames if set)
  decorators: [
    (storyFn: PartialStoryFn, context: StoryContext) => {
      const { argNames } = context.parameters;
      const object = argNames ? pick(context.args, argNames) : context.args;
      return storyFn({ args: { object } });
    },
  ],
};

export const Inheritance = {
  args: {
    storyArg: 'storyArg',
    object: {
      a: 'story',
    },
  },
  play: async ({ canvasElement }: PlayFunctionContext) => {
    // NOTE: these stories don't test project-level args inheritance as it is too problematic
    // to have an arg floating around that will apply too *all* other stories in our sandboxes.
    await expect(JSON.parse(within(canvasElement).getByTestId('pre').innerText)).toEqual({
      componentArg: 'componentArg',
      storyArg: 'storyArg',
      object: {
        a: 'story',
      },
    });
  },
};

export const Targets = {
  args: {
    a: 'a',
    b: 'b',
  },
  argTypes: {
    a: { target: 'elsewhere' },
  },
  parameters: { argNames: ['a', 'b'] },
  play: async ({ canvasElement }: PlayFunctionContext) => {
    // Check that `a` doesn't end up set
    await expect(JSON.parse(within(canvasElement).getByTestId('pre').innerText)).toEqual({
      b: 'b',
    });
  },
};

export const Events = {
  args: {
    test: 'initial',
  },
  parameters: { argNames: ['test'] },
  play: async ({ canvasElement, id }: PlayFunctionContext) => {
    const channel = globalThis.__STORYBOOK_ADDONS_CHANNEL__;
    await within(canvasElement).findByText(/initial/);

    await channel.emit('updateStoryArgs', { storyId: id, updatedArgs: { test: 'updated' } });
    await within(canvasElement).findByText(/updated/);

    await channel.emit('resetStoryArgs', { storyId: id });
    await within(canvasElement).findByText(/initial/);
  },
};
