---
title: 'Addon API'
---

Storybook's API allows developers to interact programmatically with Storybook. With the API, developers can build and deploy custom addons and other tools that enhance Storybook's functionality.

## Core Addon API

Our API is exposed via two distinct packages, each one with a different purpose:

- `@storybook/manager-api` used to interact with the Storybook manager UI or access the Storybook API.
- `@storybook/preview-api` used to control and configure the addon's behavior.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addons-api-imports.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### addons.add()

The `add` method allows you to register the type of UI component associated with the addon (e.g., panels, toolbars, tabs). For a minimum viable Storybook addon, you should provide the following arguments:

- `type`: The type of UI component to register.
- `title`: The title to feature in the Addon Panel.
- `render`: The function that renders the addon's UI component.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addon-panel-initial.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

<div class="aside">
ℹ️  The render function is called with `active` and `key`. The `active` value will be true when the panel is focused on the UI.
</div>

### addons.register()

Serves as the entry point for all addons. It allows you to register an addon and access the Storybook [API](#storybook-api). For example:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addons-api-register.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Now you'll get an instance to our StorybookAPI. See the [api docs](#storybook-api) for Storybook API regarding using that.

### addons.getChannel()

Get an instance to the channel to communicate with the manager and the preview. You can find this in both the addon register code and your addon’s wrapper component (where used inside a story).

It has a NodeJS [EventEmitter](https://nodejs.org/api/events.html) compatible API. So, you can use it to emit events and listen to events.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addons-api-getchannel.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### makeDecorator

Use the `makeDecorator` API to create decorators in the style of the official addons. Like so:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addons-api-makedecorator.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

<div class="aside">

ℹ️ If the story's parameters include `{ exampleParameter: { disable: true } }` (where `exampleParameter` is the `parameterName` of your addon), your decorator will not be called.

</div>

The `makeDecorator` API requires the following arguments:

- `name`: Unique name to identify the custom addon decorator.
- `parameterName`: Sets a unique parameter to be consumed by the addon.
- `skipIfNoParametersOrOptions`: (Optional) Doesn't run the decorator if the user hasn't options either via [decorators](../writing-stories/decorators.md) or [parameters](../writing-stories/parameters.md).
- `wrapper`: your decorator function. Takes the `getStory`, `context`, and both the `options` and `parameters` (as defined in `skipIfNoParametersOrOptions` above).

---

## Storybook API

Storybook's API allows you to access different functionalities of Storybook UI.

### api.selectStory()

The `selectStory` API method allows you to select a single story. It accepts the following two parameters; story kind name and an optional story name. For example:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'react/button-story-with-addon-example.js.mdx',
    'react/button-story-with-addon-example.ts.mdx',
    'vue/button-story-with-addon-example.js.mdx',
    'vue/button-story-with-addon-example.ts.mdx',
    'angular/button-story-with-addon-example.ts.mdx',
    'svelte/button-story-with-addon-example.js.mdx',
    'web-components/button-story-with-addon-example.js.mdx',
    'web-components/button-story-with-addon-example.ts.mdx',
  ]}
  usesCsf3
  csf2Path="addons/addons-api#snippet-button-story-with-addon-example"
/>

<!-- prettier-ignore-end -->

This is how you can select the above story:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addons-api-selectstory.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### api.selectInCurrentKind()

Similar to the `selectStory` API method, but it only accepts the story as the only parameter.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addons-api-selectincurrentkind.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### api.setQueryParams()

This method allows you to set query string parameters. You can use that as temporary storage for addons. Here's how you define query params:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addons-api-setqueryparams.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Additionally, if you need to remove a query parameter, set it as `null` instead of removing them from the addon. For example:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addons-api-disablequeryparams.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### api.getQueryParam()

Allows retrieval of a query parameter enabled via the `setQueryParams` API method. For example:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addons-api-getqueryparam.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### api.getUrlState(overrideParams)

This method allows you to get the application URL state, including any overridden or custom parameter values. For example:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addons-api-geturlstate.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### api.on(eventName, fn)

This method allows you to register a handler function called whenever the user navigates between stories.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addons-api-on.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### addons.setConfig(config)

This method allows you to override the default Storybook UI configuration (e.g., set up a [theme](../configure/theming.md) or hide UI elements):

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-config-layout.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

The following table details how to use the API values:

| Name                |     Type      |                    Description                     |             Example Value             |
| ------------------- | :-----------: | :------------------------------------------------: | :-----------------------------------: |
| **isFullscreen**    |    Boolean    |        Show story component as full screen         |                `false`                |
| **showNav**         |    Boolean    |     Display panel that shows a list of stories     |                `true`                 |
| **showPanel**       |    Boolean    |   Display panel that shows addon configurations    |                `true`                 |
| **panelPosition**   | String/Object |           Where to show the addon panel            |          `bottom` or `right`          |
| **enableShortcuts** |    Boolean    |              Enable/disable shortcuts              |                `true`                 |
| **showToolbar**     |    Boolean    |                 Show/hide toolbar                  |                `true`                 |
| **theme**           |    Object     |         Storybook Theme, see next section          |              `undefined`              |
| **selectedPanel**   |    String     |            Id to select an addon panel             |       `storybook/actions/panel`       |
| **initialActive**   |    String     |      Select the default active tab on Mobile       |   `sidebar` or `canvas` or `addons`   |
| **sidebar**         |    Object     |             Sidebar options, see below             |        `{ showRoots: false }`         |
| **toolbar**         |    Object     | Modify the tools in the toolbar using the addon id | `{ fullscreen: { hidden: false } } }` |

The following options are configurable under the `sidebar` namespace:

| Name               |   Type   |                          Description                          |                  Example Value                   |
| ------------------ | :------: | :-----------------------------------------------------------: | :----------------------------------------------: |
| **showRoots**      | Boolean  |    Display the top-level nodes as a "root" in the sidebar     |                     `false`                      |
| **collapsedRoots** |  Array   |     Set of root node IDs to visually collapse by default      |               `['misc', 'other']`                |
| **renderLabel**    | Function | Create a custom label for tree nodes; must return a ReactNode | `(item) => <abbr title="...">{item.name}</abbr>` |

The following options are configurable under the `toolbar` namespace:

| Name   |  Type  |            Description             |    Example Value    |
| ------ | :----: | :--------------------------------: | :-----------------: |
| **id** | String | Toggle visibility for toolbar item | `{ hidden: false }` |

---

## Storybook hooks

To help streamline addon development and reduce boilerplate code, the API exposes a set of hooks to access Storybook's internals. These hooks are an extension of the `@storybook/manager-api` package.

### useStorybookState

It allows access to Storybook's internal state. Similar to the [`useglobals`](#useglobals) hook, we recommend optimizing your addon to rely on [`React.memo`](https://reactjs.org/docs/react-api.html#reactmemo), or the following hooks; [`useMemo`](https://reactjs.org/docs/hooks-reference.html#usememo), [`useCallback`](https://reactjs.org/docs/hooks-reference.html#usecallback) to prevent a high volume of re-render cycles.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addons-api-usestorybookstate.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### useStorybookApi

The `useStorybookApi` hook is a convenient helper to allow you full access to the [Storybook API](#storybook-api) methods.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addons-api-useapi.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### useChannel

Allows setting subscriptions to events and getting the emitter to emit custom events to the channel.

The messages can be listened to on both the iframe and the manager.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addons-api-usechannel.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### useAddonState

The `useAddonState` is a useful hook for addons that require data persistence, either due to Storybook's UI lifecycle or for more complex addons involving multiple types (e.g., toolbars, panels).

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addons-api-useaddonstate.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### useParameter

The `useParameter` retrieves the current story's parameters. If the parameter's value is not defined, it will automatically default to the second value defined.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addons-api-useparameter.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### useGlobals

Extremely useful hook for addons that rely on Storybook [Globals](../essentials/toolbars-and-globals.md). It allows you to obtain and update `global` values. We also recommend optimizing your addon to rely on [`React.memo`](https://reactjs.org/docs/react-api.html#reactmemo), or the following hooks; [`useMemo`](https://reactjs.org/docs/hooks-reference.html#usememo), [`useCallback`](https://reactjs.org/docs/hooks-reference.html#usecallback) to prevent a high volume of re-render cycles.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addons-api-useglobal.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### useArgs

Hook that allows you to retrieve or update a story's [`args`](../writing-stories/args.md).

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/args-usage-with-addons.js.mdx'
  ]}
/>

<!-- prettier-ignore-end -->
