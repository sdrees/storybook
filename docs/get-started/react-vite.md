---
title: Storybook for React & Vite
---

export const SUPPORTED_RENDERER = 'react';

Storybook for React & Vite is a [framework](../contribute/framework.md) that makes it easy to develop and test UI components in isolation for [React](https://react.dev/) applications built with [Vite](https://vitejs.dev/). It includes:

- 🏎️ Pre-bundled for performance
- 🪄 Zero config
- 💫 and more!

<If notRenderer={SUPPORTED_RENDERER}>

<Callout variant="info">

Storybook for React & Vite is only supported in [React](?renderer=react) projects.

</Callout>

<!-- End non-supported renderers -->

</If>

<If renderer={SUPPORTED_RENDERER}>

## Requirements

- React ≥ 16.8
- Vite ≥ 4.0
- Storybook ≥ 8.0

## Getting started

### In a project without Storybook

Follow the prompts after running this command in your React project's root directory:

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

When running the `upgrade` command above, you should get a prompt asking you to migrate to `@storybook/react-vite`, which should handle everything for you. In case that auto-migration does not work for your project, refer to the manual migration below.

#### Manual migration

First, install the framework:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'react/react-vite-install.npm.js.mdx',
    'react/react-vite-install.pnpm.js.mdx',
    'react/react-vite-install.yarn.js.mdx'
  ]}
/>

<!-- prettier-ignore-end -->

Then, update your `.storybook/main.js|ts` to change the framework property:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'react/react-vite-add-framework.js.mdx',
    'react/react-vite-add-framework.ts.mdx'
  ]}
/>

<!-- prettier-ignore-end -->

## Run the Setup Wizard

If all goes well, you should see a setup wizard that will help you get started with Storybook introducing you to the main concepts and features, including how the UI is organized, how to write your first story, and how to test your components' response to various inputs utilizing [controls](../essentials/controls).

![Storybook onboarding](./example-onboarding-wizard.png)

If you skipped the wizard, you can always run it again by adding the `?path=/onboarding` query parameter to the URL of your Storybook instance, provided that the example stories are still available.

## API

### Options

You can pass an options object for additional configuration if needed:

```ts
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: {
    name: '@storybook/react-vite',
    options: {
      // ...
    },
  },
};

export default config;
```

#### `builder`

Type: `Record<string, any>`

Configure options for the [framework's builder](../api/main-config-framework.md#optionsbuilder). For this framework, available options can be found in the [Vite builder docs](../builders/vite.md).

<!-- End supported renderers -->

</If>
