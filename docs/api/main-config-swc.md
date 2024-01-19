---
title: 'swc'
---

Parent: [main.js|ts configuration](./main-config.md)

Type: `(config: swc.Options, options: Options) => swc.Options | Promise<swc.Options>`

Customize Storybook's [SWC](https://swc.rs/) setup.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/main-config-swc.js.mdx',
    'common/main-config-swc.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

## `SWC.Options`

The options provided by [SWC](https://swc.rs/) are only applicable if you've enabled the [`@storybook/addon-webpack5-compiler-swc`](https://storybook.js.org/addons/@storybook/addon-webpack5-compiler-swc) addon.

## Options

Type: `{ configType?: 'DEVELOPMENT' | 'PRODUCTION' }`

There are other options that are difficult to document here. Please introspect the type definition for more information.
