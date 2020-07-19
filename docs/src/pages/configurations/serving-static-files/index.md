---
id: 'serving-static-files'
title: 'Serving Static Files'
---

It's often useful to load static files like images and videos when creating components and stories.

Storybook provides two ways to do that.

## 1. Via Imports

You can import any media assets by importing (or requiring) them as shown below.

```js
import React from 'react';
import imageFile from './static/image.png';

export default {
  title: 'img',
};

const image = {
  src: imageFile,
  alt: 'my image',
};

export const withAnImage = () => <img src={image.src} alt={image.alt} />;
```

This is enabled with our [default config](/configurations/default-config). But, if you are using a [custom Webpack config](/configurations/custom-webpack-config), you need to add the [file-loader](https://github.com/webpack/file-loader) into your custom Webpack config.

## 2. Via a Directory

You can also configure a directory (or a list of directories) for searching static content when you are starting Storybook. You can do that with the -s flag.

See the following npm script on how to use it:

```json
{
  "scripts": {
    "start-storybook": "start-storybook -s ./public -p 9001"
  }
}
```

Here `./public` is our static directory. Now you can use static files in the public directory in your components or stories like this.

```js
import React from 'react';

export default {
  title: 'img',
};

// assume image.png is located in the "public" directory.
export const WithAnImage = () => <img src="/image.png" alt="my image" />;
```

You can also pass a list of directories separated by commas without spaces instead of a single directory.

```json
{
  "scripts": {
    "start-storybook": "start-storybook -s ./public,./static -p 9001"
  }
}
```

A second common setup is where the assets are hosted in a directory, e.g. `/public` and referenced in components like `<img src="/public/image.png" />`. Storybook's static directory behavior doesn't support this well. The workaround is to create a [soft link](https://en.wikipedia.org/wiki/Symbolic_link) in the static directory to itself.

```sh
cd public
ln -s . public
```

We'll provide better built-in [support for this use case](https://github.com/storybookjs/storybook/issues/714) in a future version of Storybook.

## 3. Via a CDN

Upload your files to an online CDN and reference them.
In this example we're using a placeholder image service.

```js
import React from 'react';

export default {
  title: 'img',
};

// assume image.png is located in the "public" directory.
export const withAnImage = () => (
  <img src="https://placehold.it/350x150" alt="My CDN placeholder" />
);
```

## Absolute versus relative paths

Sometimes, you may want to deploy your storybook into a subpath, like `https://example.com/storybook`.

In this case, you need to have all your images and media files with relative paths. Otherwise, the browser cannot locate those files.

If you load static content via importing, this is automatic and you do not have to do anything.

If you are using a static directory, then you need to use _relative paths_ to load images or use [the base element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base).
