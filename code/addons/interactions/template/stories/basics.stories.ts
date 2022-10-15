/* eslint-disable jest/no-standalone-expect */
import globalThis from 'global';
import {
  within,
  waitFor,
  fireEvent,
  userEvent,
  waitForElementToBeRemoved,
} from '@storybook/testing-library';
import { expect } from '@storybook/jest';

export default {
  component: globalThis.Components.Form,
  argTypes: {
    onSuccess: { type: 'function' },
  },
};

export const Type = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByTestId('value'), 'test');
  },
};

export const Step = {
  play: async ({ step }) => {
    await step('Enter value', Type.play);
  },
};

export const Callback = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Enter value', Type.play);

    await step('Submit', async () => {
      await fireEvent.click(canvas.getByRole('button'));
    });

    await expect(args.onSuccess).toHaveBeenCalled();
  },
};

// NOTE: of course you can use `findByText()` to implicitly waitFor, but we want
// an explicit test here
export const SyncWaitFor = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Submit form', Callback.play);
    await waitFor(() => canvas.getByText('Completed!!'));
  },
};

export const AsyncWaitFor = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Submit form', Callback.play);
    await waitFor(async () => canvas.getByText('Completed!!'));
  },
};

export const WaitForElementToBeRemoved = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('SyncWaitFor play fn', SyncWaitFor.play);
    await waitForElementToBeRemoved(() => canvas.queryByText('Completed!!'), {
      timeout: 2000,
    });
  },
};

export const WithLoaders = {
  loaders: [async () => new Promise((resolve) => setTimeout(resolve, 2000))],
  play: async ({ step }) => {
    await step('Submit form', Callback.play);
  },
};

export const Validation = {
  play: async (context) => {
    const { args, canvasElement, step } = context;
    const canvas = within(canvasElement);

    await step('Submit', async () => fireEvent.click(canvas.getByRole('button')));

    await expect(args.onSuccess).not.toHaveBeenCalled();
  },
};
