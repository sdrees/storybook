---
title: 'Viewport'
---

<YouTubeCallout id="uydF1ltw7-g" title="Stop resizing your browser — Storybook viewport" />

The Viewport toolbar item allows you to adjust the dimensions of the iframe your story is rendered in. It makes it easy to develop responsive UIs.

<video autoPlay muted playsInline loop>
  <source
    src="addon-viewports-optimized.mp4"
    type="video/mp4"
  />
</video>

## Configuration

Out of the box, the Viewport addon offers you a standard set of viewports that you can use. If you want to change the default set of viewports, you can set the global `parameters.viewport` [parameter](../writing-stories/parameters.md) in your [`.storybook/preview.js`](../configure/index.md#configure-story-rendering):

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-preview-change-viewports.js.mdx',
    'common/storybook-preview-change-viewports.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

The viewport global can take an object with the following keys:

| Field                  | Type    | Description                                               | Default Value  |
| ---------------------- | ------- | --------------------------------------------------------- | -------------- |
| **defaultViewport**    | String  | Sets the default viewport                                 | `'responsive'` |
| **defaultOrientation** | String  | Sets the default orientation (e.g. portrait or landscape) | `'portrait'`   |
| **disable**            | Boolean | Disables the viewport                                     | N/A            |
| **viewports**          | Object  | The configuration objects for the viewport                | `{}`           |

The viewports object needs the following keys:

| Field      | Type   | Description                                           | Example values          |
| ---------- | ------ | ----------------------------------------------------- | ----------------------- |
| **name**   | String | Name for the viewport                                 | `'Responsive'`          |
| **styles** | Object | Sets Inline styles to be applied to the story         | `{ width:0, height:0 }` |
| **type**   | String | Type of the device (e.g., desktop, mobile, or tablet) | `desktop`               |

### Use a detailed set of devices

The Viewport addon includes a selection of devices that you can use to test your components. Listed below are the available devices and examples of how to use them.

| Device                     | Description                                                                                                                                                                     | Dimensions (px)           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| iPhone 5                   | Configures the iPhone 5 as a device for the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'iphone5', }},`                                                    | Width: 320, Height: 568   |
| iPhone 6                   | Enables the iPhone 6 to be used with the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'iphone6', }},`                                                       | Width: 375, Height: 667   |
| iPhone 6 Plus              | Includes the iPhone 6 Plus as a device for the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'iphone6p', }},`                                                | Width: 414, Height: 736   |
| iPhone 8 Plus              | Sets the iPhone 8 Plus as a device to be used by the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'iphone8p', }},`                                          | Width: 414, Height: 736   |
| iPhone X                   | Configures the iPhone X as a device for the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'iphonex', }},`                                                    | Width: 375, Height: 812   |
| iPhone XR                  | Includes the iPhone XR as a device for the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'iphonexr', }},`                                                    | Width: 414, Height: 896   |
| iPhone XS Max              | Sets the iPhone XS Max as a device to be used by the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'iphonexsmax', }},`                                       | Width: 414, Height: 896   |
| iPhone SE (2nd generation) | Configures the iPhone SE (2nd generation) as a device for the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'iphonese2', }},`                                | Width: 375, Height: 667   |
| iPhone 12 mini             | Enables the iPhone 12 Mini to be used with the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'iphone12mini', }},`                                            | Width: 375, Height: 812   |
| iPhone 12                  | Includes the iPhone 12 as a device for the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'iphone12', }},`                                                    | Width: 390, Height: 844   |
| iPhone 12 Pro Max          | Configures the iPhone 12 Pro Max as a device for the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'iphone12promax', }},`                                    | Width: 428, Height: 926   |
| iPhone SE 3rd generation   | Enables the iPhone SE (3rd generation) to be used with the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'iphoneSE3', }},`                                   | Width: 375, Height: 667   |
| iPhone 13                  | Includes the iPhone 13 as a device for the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'iphone13', }},`                                                    | Width: 390, Height: 844   |
| iPhone 13 Pro              | Enables the iPhone 13 Pro to be used with the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'iphone13pro', }},`                                              | Width: 390, Height: 844   |
| iPhone 13 Pro Max          | Configures the iPhone 13 Pro Max as a device to be used by the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'iphone13promax', }},`                          | Width: 428, Height: 926   |
| iPhone 14                  | Enables the iPhone 14 to be used with the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'iphone14', }},`                                                     | Width: 390, Height: 844   |
| iPhone 14 Pro              | Includes the iPhone 14 Pro as a device for the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'iphone14pro', }},`                                             | Width: 393, Height: 852   |
| iPhone 14 Pro Max          | Sets the iPhone 14 Pro Max as a device to be used by the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'iphone14promax', }},`                                | Width: 430, Height: 932   |
| Galaxy S5                  | Configures the Galaxy S5 as a device for the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'galaxys5', }},`                                                  | Width: 360, Height: 640   |
| Galaxy S9                  | Enables the Galaxy S9 to be used with the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'galaxys9', }},`                                                     | Width: 360, Height: 740   |
| Nexus 5X                   | Includes the Nexus 5x as a device for the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'nexus5x', }},`                                                      | Width: 412, Height: 668   |
| Nexus 6P                   | Sets the Nexus 6P as a device to be used by the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'nexus6p', }},`                                                | Width: 412, Height: 732   |
| Pixel                      | Configures the Pixel as a device for the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'pixel', }},`                                                         | Width: 540, Height: 960   |
| Pixel XL                   | Enables the Pixel XL to be used with the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'pixelxl', }},`                                                       | Width: 720, Height: 1280  |
| Small mobile               | Enabled by default.<br/>Configures a small form factor generic mobile device to be used by the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'mobile1', }},` | Width: 320, Height: 568   |
| Large mobile               | Enabled by default.<br/>Configures a large form factor mobile device to be used by the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'mobile2', }},`         | Width: 414, Height: 896   |
| iPad                       | Includes the iPad as a device for the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'ipad', }},`                                                             | Width: 768, Height: 1024  |
| iPad Pro 10.5-in           | Enables the iPad Pro (10.5-inch) to be used with the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'ipad10p', }},`                                           | Width: 834, Height: 112   |
| iPad Pro 11-in             | Configures the iPad Pro (11-inch) as a device for the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'ipad11p', }},`                                          | Width: 834, Height: 1194  |
| iPad Pro 12.9-in           | Sets the iPad Pro (12.9-inch) as a device to be used by the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'ipad12p', }},`                                    | Width: 1024, Height: 1366 |
| Tablet                     | Enabled by default.<br/>Configures a standard form factor tablet device to be used by the Viewport addon.<br/>`parameters: { viewport: {  defaultViewport: 'tablet', }},`       | Width: 834, Height: 1112  |

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-preview-granular-viewports.js.mdx',
    'common/storybook-preview-granular-viewports.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

<Callout variant="info">

The generic devices are enabled by default as they are the most common for testing responsive UIs. You don't need to include them in your configuration if you want to use them. For the implementation details, see the [source code](https://github.com/storybookjs/storybook/tree/next/code/addons/viewport) for the Viewport addon.

</Callout>

### Add new devices

If you have either a specific viewport or a list of viewports that you need to use, you can modify your [`.storybook/preview.js`](../configure/index.md#configure-story-rendering) file and include them:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-preview-viewport-add-devices.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Make the following changes to use them in your Storybook:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-preview-viewport-use-new-devices.js.mdx',
    'common/storybook-preview-viewport-use-new-devices.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Once you start Storybook, you'll see your new viewports and devices.

You can add these two to another list of viewports if needed.

For instance, if you want to use these two with the minimal set of viewports, you can do it like so:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-preview-merge-viewports.js.mdx',
    'common/storybook-preview-merge-viewports.ts.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Both viewports (`Kindle Fire 2` and `Kindle Fire HD`) will feature in the list of devices by merging them into the [`MINIMAL_VIEWPORTS`](https://github.com/storybookjs/storybook/blob/next/code/addons/viewport/src/defaults.ts#L231).

### Configuring per component or story

In some cases, it's not practical for you to use a specific visual viewport on a global scale, and you need to adjust it to an individual story.

Update your story through [parameters](../writing-stories/parameters.md) to include your viewports at a component level or for a specific story:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'react/my-component-story-configure-viewports.js.mdx',
    'react/my-component-story-configure-viewports.ts.mdx',
    'vue/my-component-story-configure-viewports.js.mdx',
    'vue/my-component-story-configure-viewports.ts.mdx',
    'angular/my-component-story-configure-viewports.ts.mdx',
    'web-components/my-component-story-configure-viewports.js.mdx',
    'web-components/my-component-story-configure-viewports.ts.mdx',
    'svelte/my-component-story-configure-viewports.js.mdx',
    'svelte/my-component-story-configure-viewports.ts.mdx',
    'solid/my-component-story-configure-viewports.js.mdx',
    'solid/my-component-story-configure-viewports.ts.mdx',
  ]}
  usesCsf3
  csf2Path="essentials/viewport#snippet-my-component-story-configure-viewports"
/>

<!-- prettier-ignore-end -->

### Keyboard shortcuts

- Previous viewport: <kbd>shift</kbd> + <kbd>v</kbd>
- Next viewport: <kbd>v</kbd>
- Reset viewport: <kbd>alt</kbd> + <kbd>v</kbd>

If you need, you can edit them on the shortcuts page.
