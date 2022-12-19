---
title: 'Docs'
---

Documentation is an essential part of modern UI development, as it serves as a reference for developers who may need to understand or integrate your components into their own projects. Well-written documentation can help to promote the project and make it more accessible to a broader audience. Overall, the importance of writing documentation cannot be overstated, as it is a key factor in the success of any project.

In Storybook, this workflow happens automatically. When you write stories for your components, you create living, interactive, sustainable documentation.

## How does documentation work in Storybook?

You start by writing a [**story**](../writing-stories/introduction) for your component to define the different states it can be in. Then generate the baseline **documentation** for your story via `tags`. Finally, customize the documentation with [MDX](./mdx.md) or optionally with Storybook's **Doc Blocks** to fully control how the content gets rendered.

## Setup automated documentation

To enable auto-generated documentation for your stories, you'll need to add the `tags` configuration property to the story's default export. For example:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'react/button-story-auto-docs.js.mdx',
    'react/button-story-auto-docs.ts.mdx',
    'vue/button-story-auto-docs.js.mdx',
    'vue/button-story-auto-docs.ts.mdx',
    'angular/button-story-auto-docs.ts.mdx',
    'svelte/button-story-auto-docs.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

<video autoPlay muted playsInline loop>
  <source
    src="storybook-button-auto-docs-optimized.mp4"
    type="video/mp4"
  />
</video>

Once the story loads, Storybook infers the relevant metadata (e.g., [`args`](../writing-stories/args.md), [`argTypes`](../api/argtypes.md), [`parameters`](../writing-stories/parameters.md)) and automatically generates a documentation page with this information positioned at the root-level of your component tree in the sidebar.

### Configure

By default, Storybook offers zero-config support for documentation and automatically sets up a documentation page for each story enabled via the `tags` configuration property. However, you can extend your Storybook configuration file (i.e., `.storybook/main.js|ts|cjs`) and provide additional options to control how documentation gets created. Listed below are the available options and examples of how to use them.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-auto-docs-full-config.js.mdx',
    'common/storybook-auto-docs-full-config.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

| Option        | Description                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| `enabled`     | Toggles support for all documentation pages <br/> `docs: { enabled:false }`                            |
| `docsPage`    | Disables auto-generated documentation pages created via `tags` <br/> `docs: { docsPage: false }`       |
| `automatic`   | Enables auto-generated documentation pages for every component <br/> `docs: { docsPage: 'automatic' }` |
| `defaultName` | Renames the auto-generated documentation page<br/> `docs: { defaultName: 'Documentation' }`            |

### Write a custom template

To replace the default documentation template used by Storybook, you can create your own template written in MDX and update your UI configuration file (i.e., `.storybook/preview.js`) to point to it.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-preview-auto-docs-custom-template.js.mdx',
    'common/storybook-preview-auto-docs-template.mdx.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

<div class="aside">

💡 If you only need to override the documentation page for a single component, we recommend creating an MDX file and referencing it directly via the `<Meta of={} />` Doc Block.

</div>

## Setup custom documentation

Storybook provides support for MDX 2, an open standard markup language, combining two other ones: Markdown, which is used for formatting text, and JSX, which is used for rendering dynamic elements on a page. To enable custom documentation for your stories with this format, start by updating your Storybook configuration file (i.e., `.storybook/main.js|ts|cjs`).

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-auto-docs-main-mdx-config.js.mdx',
    'common/storybook-auto-docs-main-mdx-config.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Create an MDX file for your component in the same directory as your stories and components to add your custom documentation. We recommend naming the file similar to your component (e.g., `Button.mdx`) for easy reference.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-auto-docs-baseline-example.mdx.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Once the MDX documentation is loaded, Storybook will render it alongside your component's story overriding any existing documentation enabled via the [`tags`](#setup-automated-docs) configuration property.

### Fully control custom documentation

Documentation can be expensive to maintain and keep up to date when applied to every project component. To help simplify this process, Storybook provides a set of useful UI components (i.e., Doc Blocks) to help cover more advanced cases. If you need additional content, use them to help create your custom documentation.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-auto-docs-starter-example.mdx.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### Working with multiple components

If you need to document multiple components in a single documentation page, you can reference them directly inside your MDX file. Internally, Storybook looks for the story metadata and composes it alongside your existing documentation. For example:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-auto-docs-mdx-file.mdx.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

## Advanced configuration

### Customize the Docs Container

The Docs Container is the component that wraps up the documentation page. It's responsible for rendering the documentation page in Storybook's UI. You can customize it by creating your own component and updating your Storybook UI configuration file (i.e., `.storybook/preview.js`) to reference it.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-preview-auto-docs-custom-docs-container.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### Override the default theme

By default, Storybook provides two themes for the UI: `light` and `dark`. If you need to customize the theme used by the documentation to match the existing one, you can update your Storybook UI configuration file (i.e., `.storybook/preview.js`) and apply it.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-preview-auto-docs-override-theme.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### Working with custom MDX components

Out of the box, Storybook has a set of components that you can use to customize your documentation page. If you're working with a design system or component library and wish to add them to your documentation page, you can override the `MDXProvider` component inherited from `@mdx-js/react` with your own.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-preview-auto-docs-override-mdx-container.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

#### Learn more about Storybook documentation

- Docs for creating documentation for your stories
- [MDX](./mdx.md) for customizing your documentation
- [Publishing docs](./build-documentation.md) to automate the process of publishing your documentation
