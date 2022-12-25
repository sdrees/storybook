/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
declare module 'lazy-universal-dotenv';
declare module 'pnp-webpack-plugin';
declare module '@storybook/manager/paths';
declare module 'better-opn';
declare module 'open';
declare module '@aw-web-design/x-default-browser';

type Features = {
  storyStoreV7?: boolean;
  breakingChangesV7?: boolean;
  argTypeTargetsV7?: boolean;
};

var FEATURES: Features | undefined;
var STORIES: any;
var DOCS_OPTIONS: any;

// To enable user code to detect if it is running in Storybook
var IS_STORYBOOK: boolean;

// ClientApi (and StoreStore) are really singletons. However they are not created until the
// relevant framework instantiates them via `start.js`. The good news is this happens right away.
var __STORYBOOK_ADDONS_CHANNEL__: any;
var __STORYBOOK_ADDONS_PREVIEW: any;
var __STORYBOOK_CLIENT_API__: import('./modules/client-api/ClientApi').ClientApi<any>;
var __STORYBOOK_PREVIEW__: import('./modules/preview-web/PreviewWeb').PreviewWeb<any>;
var __STORYBOOK_STORY_STORE__: any;
var STORYBOOK_HOOKS_CONTEXT: any;

declare module 'ansi-to-html';
declare class AnsiToHtml {
  constructor(options: { escapeHtml: boolean });

  toHtml: (ansi: string) => string;
}
