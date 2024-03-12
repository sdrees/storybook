---
title: Storybook for Svelte & Webpack
---

export const SUPPORTED_RENDERER = 'svelte';

Storybook for Svelte & Webpack is a [framework](../contribute/framework.md) that makes it easy to develop and test UI components in isolation for applications using [Svelte](https://svelte.dev/) built with [Webpack](https://webpack.js.org/).

<If notRenderer={SUPPORTED_RENDERER}>

<Callout variant="info">

Storybook for Svelte & Webpack is only supported in [Svelte](?renderer=svelte) projects.

</Callout>

<!-- End non-supported renderers -->

</If>

<If renderer={SUPPORTED_RENDERER}>

## Requirements

- Svelte ≥ 4.0
- Webpack ≥ 5.0
- Storybook ≥ 8.0

## Getting started

### In a project without Storybook

Follow the prompts after running this command in your Svelte project's root directory:

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

When running the `upgrade` command above, you should get a prompt asking you to migrate to `@storybook/svelte-webpack5`, which should handle everything for you. In case that auto-migration does not work for your project, refer to the manual migration below.

#### Manual migration

First, install the framework:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'svelte/svelte-webpack5-install.npm.js.mdx',
    'svelte/svelte-webpack5-install.pnpm.js.mdx',
    'svelte/svelte-webpack5-install.yarn.js.mdx'
  ]}
/>

<!-- prettier-ignore-end -->

Next, install and register your appropriate compiler addon, depending on whether you're using SWC (recommended) or Babel:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addon-compiler-swc-auto-install.npm.js.mdx',
    'common/storybook-addon-compiler-swc-auto-install.pnpm.js.mdx',
    'common/storybook-addon-compiler-swc-auto-install.yarn.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

or

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addon-compiler-babel-auto-install.npm.js.mdx',
    'common/storybook-addon-compiler-babel-auto-install.pnpm.js.mdx',
    'common/storybook-addon-compiler-babel-auto-install.yarn.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

More details can be found in the [Webpack builder docs](../builders/webpack.md#compiler-support).

Finally, update your `.storybook/main.js|ts` to change the framework property:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'svelte/svelte-webpack5-add-framework.js.mdx',
    'svelte/svelte-webpack5-add-framework.ts.mdx'
  ]}
/>

<!-- prettier-ignore-end -->

## Writing native Svelte stories

Storybook provides a Svelte addon maintained by the community, enabling you to write stories for your Svelte components using the template syntax. You'll need to take some additional steps to enable this feature.

Run the following command to install the addon.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
   'svelte/svelte-csf-addon-install.yarn.js.mdx',
   'svelte/svelte-csf-addon-install.npm.js.mdx',
   'svelte/svelte-csf-addon-install.pnpm.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

<Callout variant="info">

The community actively maintains the Svelte CSF addon but still lacks some features currently available in the official Storybook Svelte framework support. For more information, see [the addon's documentation](https://github.com/storybookjs/addon-svelte-csf).

</Callout>

## API

### Options

You can pass an options object for additional configuration if needed:

```js
// .storybook/main.js
import * as path from 'path';

export default {
  // ...
  framework: {
    name: '@storybook/svelte-webpack5',
    options: {
      // ...
    },
  },
};
```

The available options are:

#### `builder`

Type: `Record<string, any>`

Configure options for the [framework's builder](../api/main-config-framework.md#optionsbuilder). For this framework, available options can be found in the [Webpack builder docs](../builders/webpack.md).

<!-- End supported renderers -->

</If>
