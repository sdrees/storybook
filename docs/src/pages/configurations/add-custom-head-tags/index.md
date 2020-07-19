---
id: 'add-custom-head-tags'
title: 'Add Custom Head Tags'
---

Sometimes, you may need to add different tags to the HTML head. This is useful for adding web fonts or some external scripts.

You can accomplish this by creating a file called `preview-head.html` inside the Storybook config directory and add tags like this:

```html
<script src="https://use.typekit.net/xxxyyy.js"></script>
<script>try{ Typekit.load(); } catch(e){ }</script>
```

That's it. Storybook will inject these tags. It is also possible to use [environment variables](https://storybook.js.org/docs/configurations/env-vars/#usage-in-custom-headbody).

> **Important**
>
> Storybook will inject these tags to the iframe where your components are rendered. So, these won’t be loaded into the main Storybook UI.

## Add Tags or Scripts to the Main UI.

Additionally, you may need to add different scripts or tags to the main Storybook UI. This might arise when your custom Webpack configuration outputs or requires additional chunks.

Create a file called `manager-head.html` inside of the Storybook config directory and add any tags you require.

> **Important**
>
> Your scripts will run before Storybook's React UI. Also be aware, that this is an uncommon scenario and could potentially break Storybook's UI. So use with caution.  
