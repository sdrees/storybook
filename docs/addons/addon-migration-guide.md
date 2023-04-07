---
title: Addon migration guide for Storybook 7.0
---

Storybook 7 is our first major release in over two years. While Storybook’s addon API has not changed much in the past couple of years, addons require several changes for compatibility with Storybook 7. This guide will walk you through the upgrade process.

<div class="aside">

As we gather feedback from the community, we’ll update this page. We also have a general [Storybook migration guide](../migration-guide.md) if you’re looking for that.

</div>

## Dependencies

The first thing to do is upgrade any Storybook dependencies in your project. We release the next version of all our packages on the `next` npm tag, so the easiest thing is to reference that in your `package.json`:

```json
{
  "dependencies": {
    "@storybook/client-logger": "next"
  }
}
```

If you'd rather depend on the latest version of Storybook, you can use the `latest` tag:

```json
{
  "dependencies": {
    "@storybook/client-logger": "latest"
  }
}
```

Or use a version specifier:

```json
{
  "dependencies": {
    "@storybook/client-logger": "^7.0.0"
  }
}
```

## Breaking changes

### `@storybook/addons` has been split into `@storybook/manager-api` and `@storybook/preview-api`

The default export from `@storybook/addons` can now be used via named imports from `@storybook/manager-api` and `@storybook/preview-api`, depending on which environment you need the API from. The manager is the Storybook UI and includes your addon's Addon Panel. While the preview is used to render stories and includes your addon's decorators.

You might also depend (and use) these packages in your addon's decorators: `@storybook/store`, `@storybook/preview-web`, `@storybook/core-client`, `@storybook/client-api`. These have all been consolidated into `@storybook/preview-api`. If you use any of these packages, please import what you need from `@storybook/preview-api` instead.

### Some components were moved from `@storybook/components` to a new package `@storybook/blocks`

Components like `ColorControl`, `ColorPalette`, `ArgsTable`, `ArgRow`, `TabbedArgsTable`, `SectionRow`, `Source`, AND `Code` were moved into a new package. In Storybook 7.0, they should be imported from `@storybook/blocks` instead.

```js
// import { ColorControl } from '@storybook/components';
import { ColorControl } from '@storybook/blocks';
```

## Deprecations and detailed migrations

We’ve also deprecated a few packages and APIs in 7.0. After you’ve made your addon working with 7.0, make sure to check the browser console in a Storybook running your addon. If you’re using deprecated packages, you should see warnings that link to migration instructions.

There are more technical details available in the [migration notes for addon authors](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#specific-instructions-for-addon-creators).

Finally, for an exhaustive list of noteworthy changes in 7.0, check [the full migration notes](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#from-version-65x-to-700).

## Releasing

You should release a new major version of this addon that supports Storybook 7. If you want to continue making changes that support Storybook 6, you should release a minor or a patch of the previous major version.

We also recommend releasing your own addon using the `next` tag to test it out in projects.

## Support

If you’ve followed this guide and your addon is still not working, please reach out on the [Storybook Discord](https://discord.gg/storybook) in the `#addons` channel and we’ll help you get to the bottom of it and upgrade the guide accordingly.
