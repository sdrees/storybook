---
title: 'Migration guide for Storybook 8.0'
---

Storybook 8 focuses on performance and stability.

- 💨 [2-4x faster test builds](/blog/optimize-storybook-7-6/#2-4x-faster-builds-with-thetest-flag), [25-50% faster React docgen](/blog/optimize-storybook-7-6/#22x-faster-react-docgen), and [SWC support for Webpack projects](/blog/optimize-storybook-7-6/#using-webpack-enable-swc)
- ✨ Improved framework support: you no longer need to install React as a peer dependency when using a non-React renderer
- 🌐 [Support for React Server Components (RSC)](/blog/storybook-react-server-components/): our experimental solution renders async RSC in the browser and mocks Node code
- ➕ Much, much more

This guide is meant to help you **upgrade from Storybook 7.x to 8.0** successfully!

<details>
<summary>ℹ️ Migrating from Storybook 6.x?</summary>

We recommend first upgrading to Storybook 7, then upgrading to Storybook 8.

To upgrade your project to Storybook 7, run:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-upgrade-to-prior-major.npm.js.mdx',
    'common/storybook-upgrade-to-prior-major.pnpm.js.mdx',
    'common/storybook-upgrade-to-prior-major.yarn.js.mdx'
  ]}
/>

<!-- prettier-ignore-end -->

Then reference the [Storybook 7 migration guide](../../release-7-6/docs/migration-guide) to ensure you address any relevant breaking changes or manual migrations.

</details>

## Major breaking changes

The rest of this guide will help you upgrade successfully, either automatically or manually. But first, there are some [breaking changes](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#from-version-7x-to-800) in Storybook 8. Here are the most impactful changes you should know about before you go further:

- [`storiesOf` API has been removed](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#removal-of-storiesof-api)
- [`*.stories.mdx` format has been removed](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#dropping-support-for-storiesmdx-csf-in-mdx-format-and-mdx1-support)
- [Implicit actions (from `argTypesRegex`) can no longer be used during rendering (e.g. in a play function)](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#implicit-actions-can-not-be-used-during-rendering-for-example-in-the-play-function)
- [`react-docgen` (instead of `react-docgen-typescript`) is the default for component analysis](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#react-docgen-component-analysis-by-default)
- [Yarn 1 is no longer supported](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#dropping-support-for-yarn-1)
- [Node 16 is no longer supported](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#dropping-support-for-nodejs-16)
- [Storyshots has been removed](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#storyshots-has-been-removed)
- [Addons API introduced in Storybook 7 is now required](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#new-addons-api)

If any of these apply to your project, please read through the the linked migration notes before continuing. If any of these new requirements or changes do not fit your project, you should probably stick with Storybook 7.x.

You may wish to read the [full migration notes](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#from-version-7x-to-800) before migrating. Or you can follow the instructions below and we’ll try to take care of everything for you!

## Automatic upgrade

To upgrade your Storybook:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-upgrade.npm.js.mdx',
    'common/storybook-upgrade.pnpm.js.mdx',
    'common/storybook-upgrade.yarn.js.mdx'
  ]}
/>

<!-- prettier-ignore-end -->

This will:

1. Upgrade your Storybook dependencies to the latest version
2. Run a collection of _automigrations_, which will:
   - Check for common upgrade tasks
   - Explain the necessary changes with links to more information
   - Ask for approval, then perform the task on your behalf

To add Storybook to a project that isn’t currently using Storybook:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/init-command.npx.js.mdx',
    'common/init-command.pnpm.js.mdx',
    'common/init-command.yarn.js.mdx'
  ]}
/>

<!-- prettier-ignore-end -->

This will:

1. Figure out which renderer (React, Vue, Angular, Web Components), builder (Webpack, Vite), or meta-framework (Next.js, SvelteKit) you’re using
2. Install Storybook 8 and auto-configure it to mirror project settings

## Manual migrations

In addition to the automated upgrades above, there are manual migrations that might be required to get Storybook 8 working in your project. We’ve tried to minimize this list to make it easier to upgrade. These include:

### `storiesOf` to CSF

Storybook architecture is focused on performance and now needs code that is statically analyzable. For that reason, it does not work with `storiesOf`. We provide a codemod which, in most cases, should automatically make the code changes for you (make sure to update the glob to fit your files):

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-migrate-stories-of-to-csf.npm.js.mdx',
    'common/storybook-migrate-stories-of-to-csf.pnpm.js.mdx',
    'common/storybook-migrate-stories-of-to-csf.yarn.js.mdx'
  ]}
/>

<!-- prettier-ignore-end -->

This will transform your stories into [CSF 1](/blog/component-story-format/) stories, which are story functions that don't accept [args](./writing-stories/args.md). These are fully supported in Storybook 8, and will continue to be for the foreseeable future.

However, we recommend [writing all **new** stories in CSF 3](./writing-stories/index.md), which are story objects that are easier to write, reuse, and maintain.

### `storiesOf` to dynamically created stories

If you are using `storiesOf` for its ability to dynamically create stories, you can build your own "storiesOf" implementation by leveraging the new [(experimental) indexer API](/docs/api/main-config-indexers). A proof of concept of such an implementation can be seen in [this StackBlitz demo](https://stackblitz.com/edit/github-h2rgfk?file=README.md). See the demo's README.md for a deeper explanation of the implementation.

### `*.stories.mdx` to MDX+CSF

Storybook now requires that MDX pages reference stories written in CSF, rather than the previous `.stories.mdx` hybrid approach. You can automatically convert your files using the following codemod (make sure to update the glob to fit your files):

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-migrate-mdx-to-csf.npm.js.mdx',
    'common/storybook-migrate-mdx-to-csf.pnpm.js.mdx',
    'common/storybook-migrate-mdx-to-csf.yarn.js.mdx'
  ]}
/>

<!-- prettier-ignore-end -->

You’ll also need to update your stories glob in `.storybook/main.js` to include the newly created .mdx and .stories.js files if it doesn’t already.

**Note:** this migration supports the Storybook 6 ["CSF stories with MDX docs"](https://github.com/storybookjs/storybook/blob/6e19f0fe426d58f0f7981a42c3d0b0384fab49b1/code/addons/docs/docs/recipes.md#csf-stories-with-mdx-docs) recipe.

## Troubleshooting

The automatic upgrade should get your Storybook into a working state. If you encounter an error running Storybook after upgrading, here’s what to do:

1. Try running the [`doctor` command](./api/cli-options.md#doctor) to check for common issues (such as duplicate dependencies, incompatible addons, or mismatched versions) and see suggestions for fixing them.
2. If you’re running `storybook` with the `dev` command, try using the `build` command instead. Sometimes `build` errors are more legible than `dev` errors!
3. Check [the full migration notes](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#from-version-7x-to-800), which contains an exhaustive list of noteworthy changes in Storybook 8. Many of these are already handled by automigrations when you upgrade, but not all are. It’s also possible that you’re experiencing a corner case that we’re not aware of.
4. Search [Storybook issues on GitHub](https://github.com/storybookjs/storybook/issues). If you’re seeing a problem, there’s a good chance other people are too. If so, upvote the issue, try out any workarounds described in the comments, and comment back if you have useful info to contribute.
5. If there’s no existing issue, you can [file one](https://github.com/storybookjs/storybook/issues/new/choose), ideally with a reproduction attached. We’ll be on top of Storybook 8 issues as we’re stabilizing the release.

If you prefer to debug yourself, here are a few useful things you can do to help narrow down the problem:

1. Try removing all addons that are not in the `@storybook` npm namespace (make sure you don't remove the `storybook` package). Community addons that work well with 7.x might not yet be compatible with 8.0, and this is the fastest way to isolate that possibility. If you find an addon that needs to be upgraded to work with Storybook 8, please post an issue on the addon’s repository, or better yet, a PR to upgrade it!
2. Another debugging technique is to bisect to older prerelease versions of Storybook to figure out which release broke your Storybook. For example, assuming that the current prerelease of Storybook is `8.0.0-beta.56`, you could set the version to `8.0.0-alpha.0` in your `package.json` and reinstall to verify that it still works (`alpha.0` should be nearly identical to `7.6.x`). If it works, you could then try `8.0.0-beta.0`, then `8.0.0-beta.28` and so forth. Once you’ve isolated the bad release, read through its [CHANGELOG](https://github.com/storybookjs/storybook/blob/next/CHANGELOG.md) entry and perhaps there’s a change that jumps out as the culprit. If you find the problem, please submit an issue or PR to the Storybook repo and we’ll do our best to take care of it quickly.

## Optional migrations

In addition to the automigrations and manual migrations above, there are also optional migrations that you should consider. These are things that we’ve deprecated in Storybook 8 (but remain backwards compatible), or best practices that should help you be more productive in the future.

These include:

### CSF 2 to CSF 3

There are [many good reasons](/blog/storybook-csf3-is-here/) to convert your stories from CSF 2 to CSF 3. We provide a codemod which, in most cases, should automatically make the code changes for you (make sure to update the glob to fit your files):

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-migrate-csf-2-to-3.npm.js.mdx',
    'common/storybook-migrate-csf-2-to-3.pnpm.js.mdx',
    'common/storybook-migrate-csf-2-to-3.yarn.js.mdx'
  ]}
/>

<!-- prettier-ignore-end -->
