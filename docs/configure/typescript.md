---
title: 'TypeScript'
---

Storybook has built-in TypeScript support, so your TypeScript project should work with zero configuration needed.

### Default configuration

The base TypeScript configuration uses [`babel-loader`](https://webpack.js.org/loaders/babel-loader/) for TypeScript transpilation, and optionally <a href="https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/blob/v4.1.6/README.md#options"><code>fork-ts-checker-webpack-plugin</code></a> for checking.

Each framework uses the base configuration unless otherwise specified:

- Angular ignores the base and uses `ts-loader` and `ngx-template-loader`.
- Vue ignores the base and uses `ts-loader` and applies it to both `.tsx` and `.vue` files.
- React adds `react-docgen-typescript-plugin` to the base.

### Main.js configuration

To make it easier to configure TypeScript handling, use the `typescript` field in your [`.storybook/main.js`](./overview.md#configure-story-rendering).

The following code snippets show the fields for you to use with TypeScript:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-main-add-ts-config.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

| Field                            | Framework | Description                                                                                 | Type                                                                                                              |
| :------------------------------- | :-------- | :------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------- |
| **check**                        | All       | Optionally run fork-ts-checker-webpack-plugin                                               | boolean                                                                                                           |
| **checkOptions**                 | All       | Options to pass to fork-ts-checker-webpack-plugin if it's enabled                           | <a href="https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/blob/v4.1.6/README.md#options">See Docs</a> |
| **reactDocgen**                  | React     | Which react docgen processor to run: `"react-docgen-typescript"`, `"react-docgen"`, `false` | string or false                                                                                                   |
| **reactDocgenTypescriptOptions** | React     | Options to pass to react-docgen-typescript-plugin if react-docgen-typescript is enabled.    | [See docs](https://github.com/hipstersmoothie/react-docgen-typescript-plugin)                                     |

### Overriding the configuration to infer additional props

The configuration provided above will remove any props from any third-party libraries.

If required, you can adjust the configuration and include the extra props.

Adjust the configuration as demonstrated below. And the next time you restart your Storybook, the extra props will also be in the UI.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-main-extend-ts-config.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

<div class="aside">
If you run into an issue where any additional props don't show up, check your component's code. If you're using a default export, change it to a named export, and doing that will ensure that the additional props are included.
</div>
