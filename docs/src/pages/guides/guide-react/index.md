---
id: 'guide-react'
title: 'Storybook for React'
---

## Automatic setup

Before trying the below commands, you should try the following command. In most cases, Storybook will detect that you're using `react` or `react-scripts`, and install the appropriate packages.

```sh
npx -p @storybook/cli sb init
```

You may have tried to use our quick start guide to setup your project for Storybook.
If it failed because it couldn't detect you're using React, you could try forcing it to use React:

```sh
npx -p @storybook/cli sb init --type react
```

If you're using [Create React App](https://create-react-app.dev/) (or a fork of `react-scripts`), you should use this command instead:

```sh
npx -p @storybook/cli sb init --type react_scripts
```

Note: You must have a `package.json` in your project or the above commands will fail.

## Manual setup

If you want to set up Storybook manually for your React project, this is the guide for you.

### A note for Create React App users

You can now use [`@storybook/preset-create-react-app`](https://github.com/storybookjs/presets/tree/master/packages/preset-create-react-app) to configure Storybook on your behalf. This is installed by Storybook during automatic setup (Storybook 5.3 or newer).

## Step 1: Add dependencies

### Add @storybook/react

Add `@storybook/react` to your project. To do that, run:

```sh
npm install @storybook/react --save-dev
```

### Add react, react-dom, @babel/core, and babel-loader

Make sure that you have `react`, `react-dom`, `@babel/core`, and `babel-loader` in your dependencies as well because we list these as a peer dependencies:

```sh
npm install react react-dom --save
npm install babel-loader @babel/core --save-dev
```

## Step 2: Add npm scripts

Then add the following scripts to your `package.json` in order to start the storybook later in this guide:

```json
{
  "scripts": {
    "storybook": "start-storybook",
    "build-storybook": "build-storybook"
  }
}
```

## Step 3: Create the main file

For a basic Storybook configuration, the only thing you need to do is tell Storybook where to find stories.

To do that, create a file at `.storybook/main.js` with the following content:

```js
module.exports = {
  stories: ['../src/**/*.stories.[tj]s'],
};
```

That will load all the stories underneath your `../src` directory that match the pattern `*.stories.js`. We recommend co-locating your stories with your source files, but you can place them wherever you choose.

## Step 4: Write your stories

Now create a `../src/index.stories.js` file, and write your first story like this:

```js
import React from 'react';
import { Button } from '@storybook/react/demo';

export default { title: 'Button' };

export const withText = () => <Button>Hello Button</Button>;

export const withEmoji = () => (
  <Button>
    <span role="img" aria-label="so cool">
      😀 😎 👍 💯
    </span>
  </Button>
);
```

Each story is a single state of your component. In the above case, there are two stories for the demo button component:

```plaintext
Button
  ├── With Text
  └── With Emoji
```

## Finally: Run your Storybook

Now everything is ready. Run your storybook with:

```sh
npm run storybook
```

Storybook should start, on a random open port in dev-mode.

Now you can develop your components and write stories and see the changes in Storybook immediately since it uses Webpack's hot module reloading.
