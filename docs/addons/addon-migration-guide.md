---
title: Addon migration guide for Storybook 8.0
---

We deeply appreciate the dedication and effort addon creators put into keeping the Storybook ecosystem vibrant and up-to-date. As Storybook evolves to version 8.0, bringing new features and improvements, this guide is here to assist you in migrating your addons from 7.x to 8.0. If you need to migrate your addon from an earlier version of Storybook, please first refer to the [Addon migration guide for Storybook 7.0](https://storybook.js.org/docs/7.6/addons/addon-migration-guide).

<Callout variant="info">

As we gather feedback from the community, we’ll update this page. We also have a general [Storybook migration guide](../migration-guide.md) if you’re looking for that.

</Callout>

## Updating dependencies

Begin by updating your Storybook dependencies. Use the `next` tag for pre-release versions, `latest` for the most recent stable release, or specify the version directly.

```json
{
  "dependencies": {
    "@storybook/client-logger": "next" // or "latest", or "^8.0.0"
  }
}
```

## Key changes for addons

Here are the essential changes in version 8.0 that impact addon development. Please check the [full migration note](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#from-version-7x-to-800) for an exhaustive list of changes in 8.0.

### Node.js 16 support dropped

Please upgrade your addon to Node.js 18, as support for Node.js 16 has ended.

### React 18 for manager UI

UI injected into panels, tools, etc. by addons is now rendered with React 18. Also note that the `key` prop is no longer passed to the render function.

### @storybook/components deprecations

`Icons` component from `@storybook/components` is now deprecated in favor of [`@storybook/icons`](https://github.com/storybookjs/icons). Additionally, various `Button` component props are also deprecated, with alternatives provided.

### Storybook layout state API changes

If you're customizing the Storybook UI configuration with `addons.setConfig({...})`, be aware of [the changes to the layout state API](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#ui-layout-state-has-changed-shape).

### Removal of deprecated features

Deprecated packages and APIs from 7.0 are now removed in 8.0.Consult the [full migration notes](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecations-which-are-now-removed) for details. Most notably for addons, the removal of the `@storybook/addons` now necessitates a switch to `@storybook/preview-api` and `@storybook/manager-api`.

### Babel-loader removed from webpack

Storybook 8 [removes babel-loader from the webpack5 builder](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#removed-babelcore-and-babel-loader-from-storybookbuilder-webpack5). If your addon's preset overrides the `babel()` method, it will break if your users are using SWC to compile their files (which is the new default for Webpack 5-based Storybook projects).

To solve for both Babel and SWC, the most robust approach is to create an [unplugin](https://github.com/unjs/unplugin) that will work with both Webpack and Vite builders. That will give you full control to run Babel (or whatever you want) on stories and components as they are loaded.

As a workaround, update your documentation to tell users to opt-in to Babel support. This should fix your addon in their project, at the cost of performance:

```sh
npx storybook@latest add @storybook/addon-webpack5-compiler-babel
```

## Releasing

Release a new major version of your addon for Storybook 8.0. We recommend you to continue supporting 7.x with minor or patch versions. We also recommend releasing your own addon using the `next` tag to test it out in projects.

## Support

If you're still having issues with your addon after following this guide, please open a [new discussion](https://github.com/storybookjs/storybook/discussions/new?category=help) in our GitHub repository.
