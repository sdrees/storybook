// Here we map the name of a module to their REFERENCE in the global scope.

export const globalsNameReferenceMap = {
  '@storybook/addons': '__STORYBOOK_MODULE_ADDONS__',
  '@storybook/global': '__STORYBOOK_MODULE_GLOBAL__',
  '@storybook/channel-postmessage': '__STORYBOOK_MODULE_CHANNEL_POSTMESSAGE__', // @deprecated: remove in 8.0
  '@storybook/channel-websocket': '__STORYBOOK_MODULE_CHANNEL_WEBSOCKET__', // @deprecated: remove in 8.0
  '@storybook/channels': '__STORYBOOK_MODULE_CHANNELS__',
  '@storybook/client-api': '__STORYBOOK_MODULE_CLIENT_API__',
  '@storybook/client-logger': '__STORYBOOK_MODULE_CLIENT_LOGGER__',
  '@storybook/core-client': '__STORYBOOK_MODULE_CORE_CLIENT__',
  '@storybook/core-events': '__STORYBOOK_MODULE_CORE_EVENTS__',
  '@storybook/preview-web': '__STORYBOOK_MODULE_PREVIEW_WEB__',
  '@storybook/preview-api': '__STORYBOOK_MODULE_PREVIEW_API__',
  '@storybook/store': '__STORYBOOK_MODULE_STORE__',
  '@storybook/types': '__STORYBOOK_MODULE_TYPES__',
} as const;

export const globalPackages = Object.keys(globalsNameReferenceMap) as Array<
  keyof typeof globalsNameReferenceMap
>;
