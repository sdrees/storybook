import { global as globalThis } from '@storybook/global';
import type { PlayFunctionContext } from '@storybook/types';
import { within, waitFor } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

export default {
  component: globalThis.Components.Button,
  args: {
    label: 'Click me',
  },
};

export const ForceReRender = {
  play: async ({ canvasElement }: PlayFunctionContext) => {
    const channel = globalThis.__STORYBOOK_ADDONS_CHANNEL__;
    const button = await within(canvasElement).findByRole('button');
    await button.focus();
    await expect(button).toHaveFocus();

    // By forcing the component to rerender, we reset the focus state
    await channel.emit('forceReRender');
    await waitFor(() => expect(button).not.toHaveFocus());
  },
};

export const ChangeArgs = {
  play: async ({ canvasElement, id }: PlayFunctionContext) => {
    const channel = globalThis.__STORYBOOK_ADDONS_CHANNEL__;
    const button = await within(canvasElement).findByRole('button');
    await button.focus();
    await expect(button).toHaveFocus();

    // Vue3: https://github.com/storybookjs/storybook/issues/13913
    // Web-components: https://github.com/storybookjs/storybook/issues/19415
    // Preact: https://github.com/storybookjs/storybook/issues/19504
    if (['vue3', 'web-components', 'html', 'preact'].includes(globalThis.storybookRenderer)) return;

    // When we change the args to the button, it should not rerender
    await channel.emit('updateStoryArgs', { storyId: id, updatedArgs: { label: 'New Text' } });
    await within(canvasElement).findByText(/New Text/);
    await expect(button).toHaveFocus();

    await channel.emit('resetStoryArgs', { storyId: id });
    await within(canvasElement).findByText(/Click me/);
    await expect(button).toHaveFocus();
  },
};
