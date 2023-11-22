import { expect, fn, within } from '@storybook/test';
import Navigation from './Navigation.svelte';

export default {
  title: 'stories/sveltekit/modules/navigation',
  component: Navigation,
  tags: ['autodocs'],
};

const goto = fn();

export const Goto = {
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const button = canvas.getByText('goto');
    button.click();
    expect(goto).toHaveBeenCalledWith('/storybook');
  },
  parameters: {
    sveltekit_experimental: {
      navigation: {
        goto,
      },
    },
  },
};

const invalidate = fn();

export const Invalidate = {
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const button = canvas.getByText('invalidate', { exact: true });
    button.click();
    expect(invalidate).toHaveBeenCalledWith('/storybook');
  },
  parameters: {
    sveltekit_experimental: {
      navigation: {
        invalidate,
      },
    },
  },
};

const invalidateAll = fn();

export const InvalidateAll = {
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const button = canvas.getByText('invalidateAll');
    button.click();
    expect(invalidateAll).toHaveBeenCalledWith();
  },
  parameters: {
    sveltekit_experimental: {
      navigation: {
        invalidateAll,
      },
    },
  },
};

const afterNavigateFn = fn();

export const AfterNavigate = {
  async play() {
    expect(afterNavigateFn).toHaveBeenCalledWith({ test: 'passed' });
  },
  args: {
    afterNavigateFn,
  },
  parameters: {
    sveltekit_experimental: {
      navigation: {
        afterNavigate: {
          test: 'passed',
        },
      },
    },
  },
};
