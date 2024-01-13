declare module '@egoist/vue-to-react';
declare module 'remark-slug';
declare module 'remark-external-links';
declare module 'acorn-jsx';
declare module 'vue/dist/vue';

declare module 'sveltedoc-parser' {
  export function parse(options: any): Promise<any>;
}

declare var FEATURES: import('@storybook/types').StorybookConfigRaw['features'];

declare var LOGLEVEL: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent' | undefined;

declare var TAGS_OPTIONS: import('@storybook/types').TagsOptions;
