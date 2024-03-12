---
title: Storybook for Web components & Vite
---

export const SUPPORTED_RENDERER = 'web-components';

Storybook for Web components & Vite is a [framework](../contribute/framework.md) that makes it easy to develop and test UI components in isolation for applications using [Web components](https://www.webcomponents.org/introduction) built with [Vite](https://vitejs.dev/).

<If notRenderer={SUPPORTED_RENDERER}>

<Callout variant="info">

Storybook for Web components & Vite is only supported in [Web components](?renderer=web-components) projects.

</Callout>

<!-- End non-supported renderers -->

</If>

<If renderer={SUPPORTED_RENDERER}>

## Requirements

- Vite ≥ 4.0
- Storybook ≥ 8.0

## Getting started

### In a project without Storybook

Follow the prompts after running this command in your Web components project's root directory:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
   'common/init-command.npx.js.mdx',
   'common/init-command.yarn.js.mdx',
   'common/init-command.pnpm.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

[More on getting started with Storybook.](./install.md)

### In a project with Storybook

This framework is designed to work with Storybook 7+. If you’re not already using v7, upgrade with this command:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-upgrade.npm.js.mdx',
    'common/storybook-upgrade.pnpm.js.mdx',
    'common/storybook-upgrade.yarn.js.mdx'
  ]}
/>

<!-- prettier-ignore-end -->

#### Automatic migration

When running the `upgrade` command above, you should get a prompt asking you to migrate to `@storybook/web-components-vite`, which should handle everything for you. In case that auto-migration does not work for your project, refer to the manual migration below.

#### Manual migration

First, install the framework:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'web-components/web-components-vite-install.npm.js.mdx',
    'web-components/web-components-vite-install.pnpm.js.mdx',
    'web-components/web-components-vite-install.yarn.js.mdx'
  ]}
/>

<!-- prettier-ignore-end -->

Then, update your `.storybook/main.js|ts` to change the framework property:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'web-components/web-components-vite-add-framework.js.mdx',
    'web-components/web-components-vite-add-framework.ts.mdx'
  ]}
/>

<!-- prettier-ignore-end -->

## API

### Options

You can pass an options object for additional configuration if needed:

```js
// .storybook/main.js
import * as path from 'path';

export default {
  // ...
  framework: {
    name: '@storybook/web-components-vite',
    options: {
      // ...
    },
  },
};
```

The available options are:

#### `builder`

Type: `Record<string, any>`

Configure options for the [framework's builder](../api/main-config-framework.md#optionsbuilder). For this framework, available options can be found in the [Vite builder docs](../builders/vite.md).

<!-- End supported renderers -->

</If>
