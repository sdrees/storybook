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

### React peer dependency is no longer required

To remove your addon's peer dependency on React, and reduce its install size, do the following:

1. Move `react`, `react-dom` and the globalized Storybook packages from `peerDependencies` to `devDependencies`
2. Add the list of globalized packages to the `externals` property in the `tsup` configuration, to ensure they are not part of the bundle.

For an example, see [the updates we've made to the addon-kit](https://github.com/storybookjs/addon-kit/pull/60/files#diff-8fed899bdbc24789a7bb4973574e624ed6207c6ce572338bc3c3e117672b2a20). These changes are optional but recommended.

<Callout variant="info"> 

This assumes your addon is using tsup for bundling. If your addon was built with an older version of addon-kit that uses Babel for bundling, you have to first switch to tsup. For guidance, explore these [older changes implemented in the addon-kit](https://github.com/storybookjs/addon-kit/pull/45/files). 

</Callout>

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

## Migration Example

The Addon Kit [repository](https://github.com/storybookjs/addon-kit) has already been updated to support Storybook 8.0, and you can use it as a reference for your migration. You'll see the changes mentioned in this guide, including ESM support via the `type: module` configuration. As an addon maintainer, we encourage you to update your addon to include them. It simplifies the setup and makes it easier for users to use your addon with the latest version of Storybook. If you choose to follow along with the ESM migration, we've prepared an abbreviated list of changes below.

- [`package.json`](https://github.com/storybookjs/addon-kit/compare/79282986..cf0875f#diff-7ae45ad102eab3b6d7e7896acd08c427a9b25b346470d7bc6507b6481575d519) for dependency management, ESM support and updates to the addon's entry points.
- [`tsup.config.ts`](https://github.com/storybookjs/addon-kit/compare/79282986..cf0875f#diff-8fed899bdbc24789a7bb4973574e624ed6207c6ce572338bc3c3e117672b2a2) for bundling changes, factoring in Storybook's globals.
- [`.storybook/local-preset.js`](https://github.com/storybookjs/addon-kit/compare/79282986..cf0875f#diff-390b53ea479b1ceffcbf31944f644ee23aa9f337b75a8a0ffd815bed50d376cb) to support the ESM migration.

<Callout variant="info" icon="💡">

If you migrate your addon to support ESM, you can safely remove any `manager.js`, `preview.js`, and `preset.js` files from the addon's root directory. For a complete overview of the changes applied to the Addon Kit to fully support Storybook 8.0, see the following [diff view](https://github.com/storybookjs/addon-kit/compare/79282986..cf0875f).

</Callout>

## Releasing

Release a new major version of your addon for Storybook 8.0. We recommend you to continue supporting 7.x with minor or patch versions. We also recommend releasing your own addon using the `next` tag to test it out in projects.

## Support

If you're still having issues with your addon after following this guide, please open a [new discussion](https://github.com/storybookjs/storybook/discussions/new?category=help) in our GitHub repository.
