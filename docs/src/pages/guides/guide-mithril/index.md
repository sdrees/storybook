---
id: 'guide-mithril'
title: 'Storybook for Mithril'
---

## Automatic setup

You may have tried to use our quick start guide to setup your project for Storybook.
If it failed because it couldn't detect you're using mithril, you could try forcing it to use mithril:

```sh
npx -p @storybook/cli sb init --type mithril
```

## Manual setup

If you want to set up Storybook manually for your mithril project, this is the guide for you.

## Step 1: Add dependencies

### Add @storybook/mithril

Add `@storybook/mithril` to your project. To do that, run:

```sh
npm install @storybook/mithril --save-dev
```

### Add mithril, @babel/core and babel-loader

Make sure that you have `mithril`, `@babel/core`, and `babel-loader` in your dependencies as well because we list these as a peer dependencies:

```sh
npm install mithril --save
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
  stories: ['../src/**/*.stories.@(ts|js)'],
};
```

That will load all the stories underneath your `../src` directory that match the pattern `*.stories.js`. We recommend co-locating your stories with your source files, but you can place them wherever you choose.

## Step 4: Write your stories

Now create a `../src/index.stories.js` file, and write your first story like this:

```js
/** @jsx m */

import m from 'mithril';
import { Button } from '<your-button>';

export default { title: 'Button' }
  
export const withText = () => (
  <Button>Hello Button</Button>
);

export const withEmoji = () => (
  <Button><span role="img" aria-label="so cool">😀 😎 👍 💯</span></Button>
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
