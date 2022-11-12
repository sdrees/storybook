// exports for builder-vite
import * as clientApi from '@storybook/client-api';

// client-api exposes both a class, and individual named exports.
// The class is used in StoryStoreV7 and the individual exports in SSv6
const { ClientApi } = clientApi;
export { createChannel as createPostMessageChannel } from '@storybook/channel-postmessage';
export { createChannel as createWebSocketChannel } from '@storybook/channel-websocket';
export { addons } from '@storybook/addons';
export { composeConfigs, PreviewWeb } from '@storybook/preview-web';
export { clientApi, ClientApi };

export type { StorybookConfig } from '@storybook/builder-vite';
