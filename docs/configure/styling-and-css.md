---
title: 'Styling and CSS'
---

There are many ways to include CSS in a web application, and correspondingly there are many ways to include CSS in Storybook. Usually, it is best to try and replicate what your application does with styling in Storybook’s configuration. To make this easier, we recommend using [`@storybook/addon-styling`](https://github.com/storybookjs/addon-styling).

## Importing CSS files

Storybook is pre-configured to recognize imports for CSS files. To add global CSS for all your stories, import it in [`.storybook/preview.js`](./overview.md#configure-story-rendering).

<FeatureSnippets paths={['configure/import-css/import-css.js.mdx', 'configure/import-css/import-css.ts.mdx']} />

If your component files import their CSS files, this will work too. The noticeable exception to this is if you're using CSS processor tools like Sass or Postcss.

<FeatureSnippets paths={['configure/css-troubleshooting/angular.mdx']} />

## CSS processors

If you're using Vite as your builder, you're covered! Vite supports Sass and PostCSS out-of-the-box 🎉

However, if you're using Webpack and want to use Sass and PostCss, you'll need some extra configuration. We recommend installing [`@storybook/addon-styling`](https://github.com/storybookjs/addon-styling#storybookaddon-styling) to help you configure these tools. Or if you'd prefer, you can customize [Storybook's webpack configuration yourself](../builders/webpack.md#override-the-default-configuration) to include the appropriate loader(s).

## CSS-in-JS

CSS-in-JS libraries are designed to use basic JavaScript, and they often work in Storybook without any extra configuration. Some libraries expect components to render in a specific rendering “context” (for example, to provide themes), which can be accomplished with `@storybook/addon-styling`'s [`withThemeFromJSXProvider` decorator](https://github.com/storybookjs/addon-styling/blob/next/docs/api.md#withthemefromjsxprovider).

## Adding webfonts

If you need webfonts to be available, you may need to add some code to the [`.storybook/preview-head.html`](./story-rendering.md#adding-to-head) file. We recommend including any assets with your Storybook if possible, in which case you likely want to configure the [static file location](./images-and-assets.md#serving-static-files-via-storybook-configuration).
