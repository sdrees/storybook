---
title: 'Storybook Composition'
---

Composition allows you to browse components from any Storybook accessible via URL inside your local Storybook. You can compose any [Storybook published online](./publish-storybook.md) or running locally no matter the view layer, tech stack, or dependencies.

![Storybook reference external](./reference-external-storybooks-composition.png)

You’ll see the composed Storybook’s stories in the sidebar alongside your own. This unlocks common workflows that teams often struggle with:

- 👩‍💻 UI developers can quickly reference prior art without switching between Storybooks.
- 🎨 Design systems can expand adoption by composing themselves into their users’ Storybooks.
- 🛠 Frontend platform can audit how components are used across projects.
- 📚 View multiple Storybooks with different tech stacks in one place

![Storybook composition](./combine-storybooks.png)

## Compose published Storybooks

In your [`.storybook/main.js|ts`](../configure/index.md#configure-story-rendering) file add a `refs` field with information about the reference Storybook. Pass in a URL to a statically built Storybook.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/main-config-refs.js.mdx',
    'common/main-config-refs.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

<Callout variant="warning">

Addons in composed Storybooks will not work as they normally do in a non-composed Storybook.

</Callout>

## Compose local Storybooks

You can also compose multiple Storybooks that are running locally. For instance, if you have a React Storybook and an Angular Storybook running on different ports, you can update your configuration file (i.e., `.storybook/main.js|ts`) and reference them as follows:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-main-ref-local.js.mdx',
    'common/storybook-main-ref-local.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Adding this configuration will combine React and Angular Storybooks into your current one. You’ll see the changes being applied automatically when either of these changes. Enabling you to develop both frameworks in sync.

## Compose Storybooks per environment

You can also compose Storybooks based on the current development environment (e.g., development, staging, production). For instance, if the project you're working on already has a published Storybook but also includes a version with cutting-edge features not yet released, you can adjust the composition based on that. For example:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/main-config-refs-with-function.js.mdx',
    'common/main-config-refs-with-function.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

<Callout variant="info" icon="💡">

Similar to other fields available in Storybook’s configuration file, the `refs` field can also be a function that accepts a `config` parameter containing Storybook’s configuration object. See the [API reference](../api/main-config-refs.md) for more information.

</Callout>

## Improve your Storybook composition

Out of the box, Storybook allows you to compose Storybooks both locally and remotely with a minor change to your configuration. However, as your Storybook grows, you might want to optimize the composition process to improve the overall performance and user experience of your Storybook by enabling the `buildStoriesJson` feature flag that will generate the `index.json` and `stories.json` files with the required information to populate the UI with your composed Storybook stories automatically. For example:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/main-config-features-build-stories-json.js.mdx',
    'common/main-config-features-build-stories-json.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

<Callout variant="info">

If you're working with a Storybook version 7.0 or higher, this flag is enabled by default. However, if you're working with an older version and you configured your Storybook to use the [`storyStoreV7`](../api/main-config-features.md#storystorev7) feature flag, you won't need this flag as it will automatically generate the required `index.json` file for you to use.

</Callout>

## Troubleshooting

### Storybook composition is not working with my project

If you're working with an outdated Storybook version or have a project-specific requirement that prevents you from updating your Storybook to the latest version, you can rely on the Storybook CLI to generate the `index.json` file when you deploy your Storybook. For example:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-extract-specific-version.npx.js.mdx',
    'common/storybook-extract-specific-version.yarn.js.mdx',
    'common/storybook-extract-specific-version.pnpm.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

<Callout variant="info">

The usage of a specific version of the CLI is intended as the `extract` command is not available in Storybook 8.0 or higher. It also requires you to provide additional configuration to generate the `index.json` file accurately. See the [previous documentation](../../../release-7-5/docs/sharing/storybook-composition.md) for more information.

</Callout>
