---
title: 'Controls'
---

<YouTubeCallout id="vAh0KdRcXpI" title="How to connect props with Storybook controls" />

Storybook Controls gives you a graphical UI to interact with a component's arguments dynamically without needing to code. It creates an addon panel next to your component examples ("stories"), so you can edit them live.

<video autoPlay muted playsInline loop>
  <source
    src="addon-controls-demo-optimized.mp4"
    type="video/mp4"
  />
</video>

Controls do not require any modification to your components. Stories for controls are:

- Convenient. Auto-generate controls based on React/Vue/Angular/etc. components.
- Portable. Reuse your interactive stories in documentation, tests, and even in designs.
- Rich. Customize the controls and interactive data to suit your exact needs.

To use the Controls addon, you need to write your stories using [args](../writing-stories/args.md). Storybook will automatically generate UI controls based on your args and what it can infer about your component. Still, you can configure the controls further using [argTypes](../api/arg-types.md), see below.

<Callout variant="info" icon="💡">

If you have stories in the older pre-Storybook 6 style, check the [args & controls migration guide](https://medium.com/storybookjs/storybook-6-migration-guide-200346241bb5) to learn how to convert your existing stories for args.

</Callout>

## Choosing the control type

<IfRenderer renderer='angular'>

By default, Storybook will choose a control for each arg based on its initial value. This will work well with specific arg types (e.g., `boolean` or `string`). To enable them, add the `component` annotation to the default export of your story file, and it will be used to infer the controls and auto-generate the matching [`argTypes`](../api/arg-types.md) for your component using [Compodoc](https://compodoc.app/) if you opt-in to use it, including first-class support for Angular's `inputs`, `outputs`, `properties`, `methods` and `view/content child/children`.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'angular/button-story-default-export-with-component.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

</IfRenderer>

<IfRenderer renderer='react'>

By default, Storybook will choose a control for each arg based on its initial value. This will work well with specific arg types (e.g., `boolean` or `string`). To enable them, add the `component` annotation to the default export of your story file and it will be used to infer the controls and auto-generate the matching [`argTypes`](../api/arg-types.md) for your component using [`react-docgen`](https://github.com/reactjs/react-docgen) or [`react-docgen-typescript`](https://github.com/styleguidist/react-docgen-typescript) for TypeScript.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'react/button-story-default-export-with-component.js.mdx',
    'react/button-story-default-export-with-component.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

</IfRenderer>

<IfRenderer renderer='vue'>

By default, Storybook will choose a control for each arg based on its initial value. This will work well with specific arg types (e.g., `boolean` or `string`). To enable them, add the `component` annotation to the default export of your story file, and it will be used to infer the controls and auto-generate the matching [`argTypes`](../api/arg-types.md) for your component using [`vue-docgen-api`](https://github.com/vue-styleguidist/vue-styleguidist/tree/dev/packages/vue-docgen-api), including first-class support for Vue's `props`, `events`, and `slots`.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'vue/button-story-default-export-with-component.js.mdx',
    'vue/button-story-default-export-with-component.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

</IfRenderer>

<IfRenderer renderer={['ember', 'html', 'svelte', 'preact', 'qwik', 'solid', 'web-components' ]}>

By default, Storybook will choose a control for each arg based on its initial value. This will work well with specific arg types (e.g., `boolean` or `string`). To enable them, add the `component` annotation to the default export of your story file, and it will be used to infer the controls and auto-generate the matching [`argTypes`](../api/arg-types.md) for your component provided by the framework you've chosen to use.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'ember/button-story-default-export-with-component.js.mdx',
    'preact/button-story-default-export-with-component.js.mdx',
    'svelte/button-story-default-export-with-component.js.mdx',
    'svelte/button-story-default-export-with-component.ts.mdx',
    'solid/button-story-default-export-with-component.js.mdx',
    'solid/button-story-default-export-with-component.ts.mdx',
    'web-components/button-story-default-export-with-component.js.mdx',
    'web-components/button-story-default-export-with-component.ts.mdx',
  ]}
/>

<Callout variant="info">

If you're using a framework that doesn't support this feature, you'll need to define the `argTypes` for your component [manually](#fully-custom-args).

</Callout>

</IfRenderer>

For instance, suppose you have a `variant` arg on your story that should be `primary` or `secondary`:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'angular/button-story-controls-primary-variant.ts.mdx',
    'web-components/button-story-controls-primary-variant.js.mdx',
    'web-components/button-story-controls-primary-variant.ts.mdx',
    'common/button-story-controls-primary-variant.js.mdx',
    'common/button-story-controls-primary-variant.ts.mdx',
  ]}
  usesCsf3
  csf2Path="essentials/controls#snippet-button-story-controls-primary-variant"
/>

<!-- prettier-ignore-end -->

By default, Storybook will render a free text input for the `variant` arg:

![Essential addon Controls using a string](addon-controls-args-variant-string.png)

It works as long as you type a valid string into the auto-generated text control. Still, it's not the best UI for our scenario, given that the component only accepts `primary` or `secondary` as variants. Let’s replace it with Storybook’s radio component.

We can specify which controls get used by declaring a custom [argType](../api/arg-types.md) for the `variant` property. ArgTypes encode basic metadata for args, such as name, description, and defaultValue for an arg. These get automatically filled in by Storybook Docs.

`ArgTypes` can also contain arbitrary annotations, which the user can override. Since `variant` is a property of the component, let's put that annotation on the default export.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'angular/button-story-controls-radio-group.ts.mdx',
    'web-components/button-story-controls-radio-group.js.mdx',
    'web-components/button-story-controls-radio-group.ts.mdx',
    'common/button-story-controls-radio-group.js.mdx',
    'common/button-story-controls-radio-group.ts.mdx',
  ]}
/>


<!-- prettier-ignore-end -->

<Callout variant="info" icon="💡">

ArgTypes are a powerful feature that can be used to customize the controls for your stories. For more information, see the documentation about [customizing controls](#annotation) with `argTypes` annotation.

</Callout>

This replaces the input with a radio group for a more intuitive experience.

![Essential Control addon with a radio group](addon-controls-args-variant-optimized.png)

## Custom control type matchers

Controls can automatically be inferred from arg's name with [regex](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RegExp), but currently only for the color picker and date picker controls. If you've used the Storybook CLI to setup your project, it should have automatically created the following defaults in `.storybook/preview.js`:

|  Control  |              Default regex               |                        Description                        |
| :-------: | :--------------------------------------: | :-------------------------------------------------------: |
| **color** | <code>/(background&#124;color)$/i</code> | Will display a color picker UI for the args that match it |
| **date**  |                `/Date$/`                 | Will display a date picker UI for the args that match it  |

If you haven't used the CLI to set the configuration, or if you want to define your patterns, use the `matchers` property in the `controls` parameter:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addon-controls-custom-matchers.js.mdx',
    'common/storybook-addon-controls-custom-matchers.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

<IfRenderer renderer={['angular', 'ember', 'html', 'preact', 'qwik', 'react', 'solid', 'vue', 'web-components' ]}>

<!-- Uncomment once frameworks that support custom templates are enabled to prevent misinformation about the example -->

## Fully custom args

Until now, we only used auto-generated controls based on the component for which we're writing stories. If we are writing [complex stories](../writing-stories/stories-for-multiple-components.md), we may want to add controls for args that aren’t part of the component. For example, here's how you could use a `footer` arg to populate a child component:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'react/page-story-slots.js.mdx',
    'react/page-story-slots.ts.mdx',
    'vue/page-story-slots.3.js.mdx',
    'vue/page-story-slots.3.ts.mdx',
    'angular/page-story-slots.ts.mdx',
    'web-components/page-story-slots.js.mdx',
    'web-components/page-story-slots.ts.mdx',
    'solid/page-story-slots.js.mdx',
    'solid/page-story-slots.ts.mdx',
  ]}
  usesCsf3
  csf2Path="writing-stories/args#snippet-page-story-slots"
/>

<!-- prettier-ignore-end -->

By default, Storybook will add controls for all args that:

- It infers from the component definition [if your framework supports it](../configure/frameworks-feature-support.md).

- Appear in the list of args for your story.

Using `argTypes`, you can change the display and behavior of each control.

</IfRenderer>

### Dealing with complex values

When dealing with non-primitive values, you'll notice that you'll run into some limitations. The most obvious issue is that not every value can be represented as part of the `args` param in the URL, losing the ability to share and deeplink to such a state. Beyond that, complex values such as JSX cannot be synchronized between the manager (e.g., Controls addon) and the preview (your story).

One way to deal with this is to use primitive values (e.g., strings) as arg values and add a custom `render` function to convert these values to their complex counterpart before rendering. It isn't the nicest way to do it (see below), but certainly the most flexible.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'react/component-story-custom-args-complex.js.mdx',
    'react/component-story-custom-args-complex.ts.mdx',
    'vue/component-story-custom-args-complex.js.mdx',
    'vue/component-story-custom-args-complex.ts.mdx',
    'angular/component-story-custom-args-complex.ts.mdx',
    'svelte/component-story-custom-args-complex.js.mdx',
    'svelte/component-story-custom-args-complex.ts.mdx',
    'web-components/component-story-custom-args-complex.js.mdx',
    'web-components/component-story-custom-args-complex.ts.mdx',
    'solid/component-story-custom-args-complex.js.mdx',
    'solid/component-story-custom-args-complex.ts.mdx',
  ]}
  usesCsf3
  csf2Path="essentials/controls#snippet-component-story-custom-args-complex"
/>

<!-- prettier-ignore-end -->

Unless you need the flexibility of a function, an easier way to map primitives to complex values before rendering is to define a `mapping`; additionally, you can specify `control.labels` to configure custom labels for your checkbox, radio, or select input.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'angular/component-story-custom-args-mapping.ts.mdx',
    'web-components/component-story-custom-args-mapping.js.mdx',
    'web-components/component-story-custom-args-mapping.ts.mdx',
    'common/component-story-custom-args-mapping.js.mdx',
    'common/component-story-custom-args-mapping.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Note that both `mapping` and `control.labels` don't have to be exhaustive. If the currently selected option is not listed, it's used verbatim.

## Configuration

The Controls addon can be configured in two ways:

- Individual controls can be configured via control annotations.
- The addon's appearance can be configured via parameters.

### Annotation

As shown above, you can configure individual controls with the “control" annotation in the [argTypes](../api/arg-types.md) field of either a component or story. Below is a condensed example and table featuring all available controls.

| Data Type   | Control        | Description                                                                                                                                                                                                               |
| ----------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **boolean** | `boolean`      | Provides a toggle for switching between possible states.<br/> `argTypes: { active: { control: 'boolean' }}`                                                                                                               |
| **number**  | `number`       | Provides a numeric input to include the range of all possible values.<br/> `argTypes: { even: { control: { type: 'number', min:1, max:30, step: 2 } }}`                                                                   |
|             | `range`        | Provides a range slider component to include all possible values.<br/> `argTypes: { odd: { control: { type: 'range', min: 1, max: 30, step: 3 } }}`                                                                       |
| **object**  | `object`       | Provides a JSON-based editor component to handle the object's values.<br/> Also allows edition in raw mode.<br/> `argTypes: { user: { control: 'object' }}`                                                               |
| **array**   | `object`       | Provides a JSON-based editor component to handle the values of the array.<br/> Also allows edition in raw mode.<br/> `argTypes: { odd: { control: 'object' }}`                                                            |
|             | `file`         | Provides a file input component that returns an array of URLs.<br/> Can be further customized to accept specific file types.<br/> `argTypes: { avatar: { control: { type: 'file', accept: '.png' } }}`                    |
| **enum**    | `radio`        | Provides a set of radio buttons based on the available options.<br/> `argTypes: { contact: { control: 'radio', options: ['email', 'phone', 'mail'] }}`                                                                    |
|             | `inline-radio` | Provides a set of inlined radio buttons based on the available options.<br/> `argTypes: { contact: { control: 'inline-radio', options: ['email', 'phone', 'mail'] }}`                                                     |
|             | `check`        | Provides a set of checkbox components for selecting multiple options.<br/> `argTypes: { contact: { control: 'check', options: ['email', 'phone', 'mail'] }}`                                                              |
|             | `inline-check` | Provides a set of inlined checkbox components for selecting multiple options.<br/> `argTypes: { contact: { control: 'inline-check', options: ['email', 'phone', 'mail'] }}`                                               |
|             | `select`       | Provides a drop-down list component to handle single value selection. `argTypes: { age: { control: 'select', options: [20, 30, 40, 50] }}`                                                                                |
|             | `multi-select` | Provides a drop-down list that allows multiple selected values. `argTypes: { countries: { control: 'multi-select', options: ['USA', 'Canada', 'Mexico'] }}`                                                               |
| **string**  | `text`         | Provides a freeform text input. <br/> `argTypes: { label: { control: 'text' }}`                                                                                                                                           |
|             | `color`        | Provides a color picker component to handle color values.<br/> Can be additionally configured to include a set of color presets.<br/> `argTypes: { color: { control: { type: 'color', presetColors: ['red', 'green']} }}` |
|             | `date`         | Provides a datepicker component to handle date selection. `argTypes: { startDate: { control: 'date' }}`                                                                                                                   |

<Callout variant="info" icon="💡">

The `date` control will convert the date into a UNIX timestamp when the value changes. It's a known limitation that will be fixed in a future release. If you need to represent the actual date, you'll need to update the story's implementation and convert the value into a date object.

</Callout>

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'angular/gizmo-story-controls-customization.ts.mdx',
    'web-components/gizmo-story-controls-customization.js.mdx',
    'web-components/gizmo-story-controls-customization.ts.mdx',
    'common/gizmo-story-controls-customization.js.mdx',
    'common/gizmo-story-controls-customization.ts.mdx',
  ]}
/>


<!-- prettier-ignore-end -->

<Callout variant="info" icon="💡">

Numeric data types will default to a `number` control unless additional configuration is provided.

</Callout>

### Parameters

Controls supports the following configuration [parameters](../writing-stories/parameters.md), either globally or on a per-story basis:

#### Show full documentation for each property

Since Controls is built on the same engine as Storybook Docs, it can also show property documentation alongside your controls using the expanded parameter (defaults to false). This means you embed a complete [`Controls`](../api/doc-block-controls.md) doc block in the controls panel. The description and default value rendering can be [customized](#fully-custom-args) like the doc block.

To enable expanded mode globally, add the following to [`.storybook/preview.js`](../configure/index.md#configure-story-rendering):

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-preview-expanded-controls.js.mdx',
    'common/storybook-preview-expanded-controls.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Here's what the resulting UI looks like:

![Controls addon expanded](./addon-controls-expanded.png)

#### Specify initial preset color swatches

For `color` controls, you can specify an array of `presetColors`, either on the `control` in `argTypes`, or as a parameter under the `controls` namespace:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-preview-parameters-color-swatches.js.mdx',
    'common/storybook-preview-parameters-color-swatches.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Color presets can be defined as an object with `color` and `title` or a simple CSS color string. These will then be available as swatches in the color picker. When you hover over the color swatch, you'll be able to see its title. It will default to the nearest CSS color name if none is specified.

#### Filtering controls

In specific cases, you may be required to display only a limited number of controls in the controls panel or all except a particular set.

To make this possible, you can use optional `include` and `exclude` configuration fields in the `controls` parameter, which you can define as an array of strings or a regular expression.

Consider the following story snippets:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'angular/component-story-disable-controls-regex.ts.mdx',
    'web-components/component-story-disable-controls-regex.js.mdx',
    'web-components/component-story-disable-controls-regex.ts.mdx',
    'common/component-story-disable-controls-regex.js.mdx',
    'common/component-story-disable-controls-regex.ts.mdx',
  ]}
  usesCsf3
  csf2Path="essentials/controls#snippet-component-story-disable-controls-regex"
/>

<!-- prettier-ignore-end -->

#### Sorting controls

By default, controls are unsorted and use whatever order the args data is processed in (`none`). Additionally, you can sort them alphabetically by the arg's name (`alpha`) or with the required args first (`requiredFirst`).

Consider the following snippet to force required args first:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'angular/component-story-sort-controls.ts.mdx',
    'web-components/component-story-sort-controls.js.mdx',
    'web-components/component-story-sort-controls.ts.mdx',
    'common/component-story-sort-controls.js.mdx',
    'common/component-story-sort-controls.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### Disable controls for specific properties

Aside from the features already documented here, Controls can also be disabled for individual properties.

Suppose you want to turn off Controls for a property called `foo` in a component's story. The following example illustrates how:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'angular/component-story-disable-controls.ts.mdx',
    'web-components/component-story-disable-controls.js.mdx',
    'web-components/component-story-disable-controls.ts.mdx',
    'common/component-story-disable-controls.js.mdx',
    'common/component-story-disable-controls.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Resulting in the following change in Storybook UI:

<video autoPlay muted playsInline loop>
  <source
    src="addon-controls-disable-specific-prop-optimized.mp4"
    type="video/mp4"
  />
</video>

The previous example also removed the prop documentation from the table. In some cases, this is fine. However, sometimes you might want to render the prop documentation without a control. The following example illustrates how:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'angular/component-story-disable-controls-alt.ts.mdx',
    'web-components/component-story-disable-controls-alt.js.mdx',
    'web-components/component-story-disable-controls-alt.ts.mdx',
    'common/component-story-disable-controls-alt.js.mdx',
    'common/component-story-disable-controls-alt.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

<Callout variant="info" icon="💡">

As with other Storybook properties, such as [decorators](../writing-stories/decorators.md), you can apply the same pattern at a story level for more granular cases.

</Callout>

### Conditional controls

In some cases, it's useful to be able to conditionally exclude a control based on the value of another control. Controls supports basic versions of these use cases with the `if`, which can take a simple query object to determine whether to include the control.

Consider a collection of "advanced" settings only visible when the user toggles an "advanced" toggle.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'angular/component-story-conditional-controls-toggle.ts.mdx',
    'web-components/component-story-conditional-controls-toggle.js.mdx',
    'web-components/component-story-conditional-controls-toggle.ts.mdx',
    'common/component-story-conditional-controls-toggle.js.mdx',
    'common/component-story-conditional-controls-toggle.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Or consider a constraint where if the user sets one control value, it doesn't make sense for the user to be able to set another value.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'angular/component-story-conditional-controls-mutual-exclusion.ts.mdx',
    'web-components/component-story-conditional-controls-mutual-exclusion.js.mdx',
    'web-components/component-story-conditional-controls-mutual-exclusion.ts.mdx',
    'common/component-story-conditional-controls-mutual-exclusion.js.mdx',
    'common/component-story-conditional-controls-mutual-exclusion.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

The query object must contain either an `arg` or `global` target:

| field  | type   | meaning                       |
| ------ | ------ | ----------------------------- |
| arg    | string | The ID of the arg to test.    |
| global | string | The ID of the global to test. |

It may also contain at most one of the following operators:

| operator | type    | meaning                                              |
| -------- | ------- | ---------------------------------------------------- |
| truthy   | boolean | Is the target value truthy?                          |
| exists   | boolean | Is the target value defined?                         |
| eq       | any     | Is the target value equal to the provided value?     |
| neq      | any     | Is the target value NOT equal to the provided value? |

If no operator is provided, that is equivalent to `{ truthy: true }`.

<IfRenderer renderer='angular'>

## Troubleshooting

### Controls are not automatically generated for my component

Out of the box, Storybook will try to infer the required argTypes and associated controls for your stories based on the component's definition and the initial value of the args. However, in some cases, this may not be enough, and you may need to provide additional information to Storybook. To solve this, you can opt-in to use [Compodoc](https://compodoc.app/), a documentation generator for Angular applications that can extract the metadata of your components and generate the required argTypes and controls for your stories.

Run the following command to install the tooling.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
   'angular/compodoc-install.yarn.js.mdx',
   'angular/compodoc-install.npm.js.mdx',
   'angular/compodoc-install.pnpm.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Update your `angular.json` file to include the following configuration to include it in the Storybook's inbuilt builder configuration.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
   'angular/angular-project-compodoc-config.json.mdx',
  ]}
/>


<!-- prettier-ignore-end -->

Finally, update your `.storybook/preview.ts` file to include the following configuration to import the metadata generated by Compodoc and use it to generate the controls and argTypes for your stories.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
   'angular/storybook-preview-compodoc-config.ts.mdx',
  ]}
/>


<!-- prettier-ignore-end -->

</IfRenderer>

<IfRenderer renderer='web-components'>

## Troubleshooting

### Controls are not automatically generated for my component

Out of the box, Storybook will try to infer the required argTypes and associated controls for your stories based on the component's definition and the initial value of the args. However, in some cases, this may not be enough, and you may need to provide additional information to Storybook. To solve this, you can generate a [`custom-elements.json`](https://github.com/webcomponents/custom-elements-json) file with [`@custom-elements-manifest/analyzer`](https://github.com/open-wc/custom-elements-manifest) if you're using the `pre-v1.0.0` version of the elements file or [`@custom-elements-manifest/analyzer`](https://github.com/open-wc/custom-elements-manifest) for newer versions and configure it in your Storybook UI configuration file (i.e., `.storybook/preview.js|ts`) to enable it.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
   'web-components/storybook-preview-custom-elements-config.js.mdx',
   'web-components/storybook-preview-custom-elements-config.ts.mdx',
  ]}
/>


<!-- prettier-ignore-end -->

</IfRenderer>

<IfRenderer renderer='ember'>

## Troubleshooting

### Controls are not automatically generated for my component

Out of the box, Storybook will try to infer the required argTypes and associated controls for your stories based on the metadata provided by the [`@storybook/ember-cli-storybook`](https://github.com/storybookjs/ember-cli-storybook) addon. However, in some cases, this may not be enough, and you may need to customize your project configuration to provide additional information to Storybook to generate the required argTypes and controls for your stories.

Update your `ember-cli-build.js` configuration file to include the addon.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
   'ember/storybook-ember-cli-build.js.mdx',
  ]}
/>


<!-- prettier-ignore-end -->

Restart your application to generate the metadata file (i.e., `storybook-docgen/index.json`) and update your `.storybook/preview.js` file to include it, which will be used to create the controls and argTypes for your stories.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
   'ember/storybook-preview-custom-metadata.js.mdx',
  ]}
/>


<!-- prettier-ignore-end -->

<Callout variant="info">

Enabling this feature will generate a `storybook-docgen/index.json` automatically with each build. For more information on how the metadata is generated, refer to [documentation](https://github.com/storybookjs/storybook/tree/next/code/frameworks/ember) for the Ember framework.

</Callout>

</IfRenderer>

## API

### Parameters

This addon contributes the following [parameters](../writing-stories/parameters.md) to Storybook, under the `controls` namespace:

#### `disable`

Type: `boolean`

Disable this addon's behavior. If you wish to disable this addon for the entire Storybook, you should do so when registering `addon-essentials`. See the [essential addon's docs](../essentials/index.md#disabling-addons) for more information.

This parameter is most useful to allow overriding at more specific levels. For example, if this parameter is set to `true` at the project level, it could then be re-enabled by setting it to `false` at the meta (component) or story level.

#### `exclude`

Type: `string[] | RegExp`

Specifies which properties to exclude from the Controls addon panel. Any properties whose names match the regex or are part of the array will be left out. See [usage example](#filtering-controls), above.

#### `expanded`

Type: `boolean`

Show the full documentation, including description and default value, for each property in the Controls addon panel. See [usage example](#show-full-documentation-for-each-property), above.

#### `hideNoControlsWarning`

Type: `boolean`

Hide the warning that appears when no controls are defined for a story. See [usage example](#hide-nocontrols-warning), above.

#### `include`

Type: `string[] | RegExp`

Specifies which properties to include in the Controls addon panel. Any properties whose names don't match the regex or are not part of the array will be left out. See [usage example](#filtering-controls), above.

#### `presetColors`

Type: `(string | { color: string; title?: string })[]`

Specify preset color swatches for the color picker control. Color value many be any valid CSS color. See [usage example](#specify-initial-preset-color-swatches), above.

#### `sort`

Type: `'none' | 'alpha' | 'requiredFirst'`

Default: `'none'`

Specifies how the controls are sorted.

- **none**: Unsorted, displayed in the same order the arg types are processed in
- **alpha**: Sorted alphabetically, by the arg type's name
- **requiredFirst**: Same as `alpha`, with any required arg types displayed first
