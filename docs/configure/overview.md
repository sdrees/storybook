---
title: 'Configure Storybook'
---

Storybook is configured via a folder called `.storybook`, which contains various configuration files.

<div class="aside">

Note that you can change the folder that Storybook uses by setting the `-c` flag to your `start-storybook` and `build-storybook` scripts.

</div>

## Configure your Storybook project

The main configuration file is `main.js|ts`. This file controls the Storybook server's behavior, so you must restart Storybook’s process when you change it. It contains the following:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-main-default-setup.js.mdx',
    'common/storybook-main-baseline-setup.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

The `main.js|ts` configuration file is a [preset](../addons/addon-types.md) and, as such, has a powerful interface, but the key fields within it are:

- `stories` - an array of globs that indicates the [location of your story files](#configure-story-loading), relative to `main.js`.
- `addons` - a list of the [addons](https://storybook.js.org/addons/) you are using.
- `webpackFinal` - custom [Webpack configuration](../builders/webpack.md#extending-storybooks-webpack-config).
- `babel` - custom [babel configuration](./babel.md).
- `framework` - [framework specific configurations](./frameworks.md) to help the loading and building process.
- `docs` - [auto-generated documentation](../writing-docs/docs-page.md.md) configuration.

<div class="aside">
 💡 Tip: Customize your default story by referencing it first in the `stories` array.
</div>

See all the [available](#using-storybook-types-in-your-configuration) fields below if you need further customization.

### Feature flags

Additionally, you can also provide additional feature flags to your Storybook configuration. Below is an abridged list of available features that are currently available.

| Configuration element | Description                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `storyStoreV7`        | Configures Storybook to load stories [on demand](#on-demand-story-loading), rather than during boot up. <br/> `features: { storyStoreV7: true }` |
| `buildStoriesJson`    | Generates a `stories.json` file to help story loading with the on demand mode. <br/> `features: { buildStoriesJson: true }`                      |

## Configure story loading

By default, Storybook will load stories from your project based on a glob (pattern matching string) in `.storybook/main.js` that matches all files in your project with extension `.stories.*`. The intention is you colocate a story file with the component it documents.

```
•
└── components
    ├── Button.js
    └── Button.stories.js
```

If you want to use a different naming convention, you can alter the glob using the syntax supported by [picomatch](https://github.com/micromatch/picomatch#globbing-features).

For example, if you wanted to pull both `.md` and `.js` files from the `my-project/src/components` directory, you could write:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-main-js-md-files.js.mdx',
    'common/storybook-main-js-md-files.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### With a configuration object

Additionally, you can customize your Storybook configuration to load your stories based on a configuration object. For example, if you wanted to load your stories from a `packages` directory, you could adjust your `stories` configuration field into the following:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-storyloading-with-custom-object.js.mdx',
    'common/storybook-storyloading-with-custom-object.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

When Storybook starts, it will look for any file containing the `stories` extension inside the `packages/stories` directory and generate the titles for your stories.

### With a directory

You can also simplify your Storybook configuration and load the stories based on a directory. For example, if you want to load all the stories inside a `packages/MyStories`, you can adjust the configuration as such:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-storyloading-with-directory.js.mdx',
    'common/storybook-storyloading-with-directory.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### With a custom implementation

You can also adjust your Storybook configuration and implement your custom logic for loading your stories. For example, suppose you were working on a project that includes a particular pattern that the conventional ways of loading stories could not solve, in that case, you could adjust your configuration as follows:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-storyloading-custom-logic.js.mdx',
    'common/storybook-storyloading-custom-logic.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### On-demand story loading

As your Storybook grows, it gets challenging to load all of your stories performantly, slowing down the loading times and yielding a large bundle. Out of the box, Storybook loads your stories on demand rather than during boot-up to improve the performance of your Storybook. If you need to load all of your stories during boot-up, you can disable this feature by setting the `storyStoreV7` feature flag to `false` in your configuration as follows:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-on-demand-story-loading.js.mdx',
    'common/storybook-on-demand-story-loading.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

#### Known limitations

This feature is experimental, and it has some limitations on what you can and cannot do in your stories files. If you plan to use it, you'll need to take into consideration the following limitations:

- [CSF formats](../api/csf.md) from version 1 to version 3 are supported. The `storiesOf` construct is not.
- Custom`storySort` functions are allowed based on a restricted API.

## Configure your project with TypeScript

If you would like, you can also write your Storybook configuration using TypeScript. To get started, add a `.babelrc` file inside your project and include the following Babel presets:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-ts-config-babelrc.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

This babel config will be used to process your stories, as well as your config files.

Alternatively, you can install [`ts-node`](https://typestrong.org/ts-node/) in your project, which will be used to process your config files without the need for a `.babelrc`.

Rename your `.storybook/main.js` to `.storybook/main.ts` and restart your Storybook.

### Using Storybook Types in Your Configuration

You can also use Storybook's TypeScript types to ensure you are using valid options and get autocompletion in your editor. Below is an abridged Storybook configuration with TypeScript types and additional information about each configuration element.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-main-default-setup.ts.mdx',
  ]}
/>

See the vite builder [TypeScript documentation](https://github.com/storybookjs/builder-vite#typescript) if using `@storybook/builder-vite`.

<!-- prettier-ignore-end -->

| Configuration element | Description                                                                                                                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stories`             | The array of globs that indicates the [location of your story files](#configure-story-loading), relative to `main.ts`                                                                                    |
| `staticDirs`          | Sets a list of directories of [static files](./images-and-assets.md#serving-static-files-via-storybook-configuration) to be loaded by Storybook <br/> `staticDirs:['../public']`                         |
| `addons`              | Sets the list of [addons](https://storybook.js.org/addons/) loaded by Storybook <br/> `addons: ['@storybook/addon-essentials']`                                                                          |
| `typescript`          | Configures how Storybook handles [TypeScript files](./typescript.md) <br/> `typescript: { check: false, checkOptions: {} }`                                                                              |
| `framework`           | Configures Storybook based on a set of [framework-specific](./frameworks.md) settings <br/> `framework: { name: '@storybook/svelte-vite', options:{} }`                                                  |
| `core`                | Configures Storybook's internal features.<br/> `core: { disableTelemetry: true, }`                                                                                                                       |
| `docs`                | Configures Storybook's [auto-generated documentation](../writing-docs/docs-page.md)<br/> `docs: { autodocs: 'tag' }`                                                                                     |
| `features`            | Enables Storybook's additional features<br/> See table below for a list of available features `features: { storyStoreV7: true }`                                                                         |
| `refs`                | Configures [Storybook composition](../sharing/storybook-composition.md) <br/> `refs:{ example: { title: 'ExampleStorybook', url:'https://your-url.com' } }`                                              |
| `logLevel`            | Configures Storybook's logs in the browser terminal. Useful for debugging <br/> `logLevel: 'debug'`                                                                                                      |
| `webpackFinal`        | Customize Storybook's [Webpack](../builders/webpack.md) setup <br/> `webpackFinal: async (config:any) => { return config; }`                                                                             |
| `viteFinal`           | Customize Storybook's Vite setup when using the [vite builder](https://github.com/storybookjs/builder-vite) <br/> `viteFinal: async (config: Vite.InlineConfig, options: Options) => { return config; }` |
| `env`                 | Defines custom Storybook [environment variables](./environment-variables.md#using-storybook-configuration). <br/> `env: (config) => ({...config, EXAMPLE_VAR: 'Example var' }),`                         |

## Configure story rendering

To control the way stories are rendered and add global [decorators](../writing-stories/decorators.md#global-decorators) and [parameters](../writing-stories/parameters.md#global-parameters), create a `.storybook/preview.js` file. This is loaded in the Canvas tab, the “preview” iframe that renders your components in isolation. Use `preview.js` for global code (such as [CSS imports](../get-started/setup.md#render-component-styles) or JavaScript mocks) that applies to all stories.

The `preview.js` file can be an ES module and export the following keys:

- `decorators` - an array of global [decorators](../writing-stories/decorators.md#global-decorators)
- `parameters` - an object of global [parameters](../writing-stories/parameters.md#global-parameters)
- `globalTypes` - definition of [globalTypes](../essentials/toolbars-and-globals.md#global-types-and-the-toolbar-annotation)

If you’re looking to change how to order your stories, read about [sorting stories](../writing-stories/naming-components-and-hierarchy.md#sorting-stories).

## Configure Storybook’s UI

To control the behavior of Storybook’s UI (the **“manager”**), you can create a `.storybook/manager.js` file.

This file does not have a specific API but is the place to set [UI options](./features-and-behavior.md) and to configure Storybook’s [theme](./theming.md).
