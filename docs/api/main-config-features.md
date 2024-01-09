---
title: 'features'
---

Parent: [main.js|ts configuration](./main-config.md)

Type:

```ts
{
  argTypeTargetsV7?: boolean;
  legacyDecoratorFileOrder?: boolean;
  legacyMdx1?: boolean;
}
```

Enables Storybook's additional features.

## `legacyDecoratorFileOrder`

Type: `boolean`

Apply decorators from preview.js before decorators from addons or frameworks. [More information](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#changed-decorator-order-between-previewjs-and-addonsframeworks).

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/main-config-features-legacy-decorator-file-order.js.mdx',
    'common/main-config-features-legacy-decorator-file-order.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

## `argTypeTargetsV7`

(⚠️ **Experimental**)

Type: `boolean`

Filter args with a "target" on the type from the render function.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/main-config-features-arg-type-targets-v7.js.mdx',
    'common/main-config-features-arg-type-targets-v7.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->
