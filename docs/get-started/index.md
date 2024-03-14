---
title: Get started with Storybook
hideRendererSelector: true
---

<!-- prettier-ignore-start -->

export const RightArrow = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.896 10.146a.5.5 0 00.708.708l3.5-3.5a.5.5 0 000-.708l-3.5-3.5a.5.5 0 10-.708.708L8.043 7l-3.147 3.146z" fill="currentColor"></path></svg>
);

<!-- prettier-ignore-end -->

Welcome to Storybook's documentation ✦ Learn how to get started with Storybook in your project. Then, explore Storybook's main concepts and discover additional resources to help you grow and maintain your Storybook.

## What is Storybook?

Storybook is a frontend workshop for building UI components and pages in isolation. It helps you develop and share hard-to-reach states and edge cases without needing to run your whole app. Thousands of teams use it for UI development, testing, and documentation. It's open source and free.

## Install Storybook

Storybook is a standalone tool that runs alongside your app. It's a zero-config environment that works with any modern frontend framework. You can install Storybook into an existing project or create a new one from scratch.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
   'common/init-command.npx.js.mdx',
   'common/init-command.yarn.js.mdx',
   'common/init-command.pnpm.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

<div class="sb-grid three-up">
  <a href="./nextjs/?renderer=react" class="framework card">
    <img src="/images/logos/renderers/logo-nextjs.svg" width="28" height="28" alt="" class="img" />
    <h3>Next.js</h3>
  </a>
  <a href="./react-vite/?renderer=react" class="framework card">
    <img src="/images/logos/renderers/logo-react.svg" width="28" height="28" alt="" class="img" />
    <div>
      <h3>React</h3>
      <p>with Vite</p>
    </div>
  </a>
  <a href="./react-webpack5/?renderer=react" class="framework card">
    <img src="/images/logos/renderers/logo-react.svg" width="28" height="28" alt="" class="img" />
    <div>
      <h3>React</h3>
      <p>with Webpack</p>
    </div>
  </a>
  <a href="https://github.com/storybookjs/react-native" target="_blank" class="framework card">
    <img src="/images/logos/renderers/logo-react.svg" width="28" height="28" alt="" class="img" />
    <h3>React Native</h3>
  </a>
  <a href="./vue3-vite/?renderer=vue" class="framework card">
    <img src="/images/logos/renderers/logo-vue.svg" width="28" height="28" alt="" class="img" />
    <div>
      <h3>Vue</h3>
      <p>with Vite</p>
    </div>
  </a>
  <a href="./vue3-webpack5/?renderer=vue" class="framework card">
    <img src="/images/logos/renderers/logo-vue.svg" width="28" height="28" alt="" class="img" />
    <div>
      <h3>Vue</h3>
      <p>with Webpack</p>
    </div>
  </a>
  <a href="./angular/?renderer=angular" class="framework card">
    <img src="/images/logos/renderers/logo-angular.svg" width="28" height="28" alt="" class="img" />
    <h3>Angular</h3>
  </a>
  <a href="./sveltekit/?renderer=svelte" class="framework card">
    <img src="/images/logos/renderers/logo-svelte.svg" width="28" height="28" alt="" class="img" />
    <h3>SvelteKit</h3>
  </a>
  <a href="./svelte-vite/?renderer=svelte" class="framework card">
    <img src="/images/logos/renderers/logo-svelte.svg" width="28" height="28" alt="" class="img" />
    <div>
      <h3>Svelte</h3>
      <p>with Vite</p>
    </div>
  </a>
  <a href="./svelte-webpack5/?renderer=svelte" class="framework card">
    <img src="/images/logos/renderers/logo-svelte.svg" width="28" height="28" alt="" class="img" />
    <div>
      <h3>Svelte</h3>
      <p>with Webpack</p>
    </div>
  </a>
  <a href="./web-components-vite/?renderer=web-components" class="framework card">
    <img src="/images/logos/renderers/logo-web-components.svg" width="28" height="28" alt="" class="img" />
    <div>
      <h3>Web Components</h3>
      <p>with Vite</p>
    </div>
  </a>
  <a href="./web-components-webpack5/?renderer=web-components" class="framework card">
    <img src="/images/logos/renderers/logo-web-components.svg" width="28" height="28" alt="" class="img" />
    <div>
      <h3>Web Components</h3>
      <p>with Webpack</p>
    </div>
  </a>
</div>

Want to know more about installing Storybook? Check out the [installation guide](./install.md).

## Main concepts

Storybook is a powerful tool that can help you with many aspects of your UI development workflow. Here are some of the main concepts to get you started.

<div class="sb-grid two-up">
  <a href="../writing-stories/" class="card card-large concept">
    <img src="/images/icons/icon-story.svg" alt="" width="20" height="20" class="img" />
    <h3>Stories</h3>
    <p>A story captures the rendered state of a UI component. Each component can have multiple stories, where each story describes a different component state.</p>
  </a>
  <a href="../writing-docs/" class="card card-large concept">
    <img src="/images/icons/icon-docs.svg" alt="" width="20" height="20" class="img" />
    <h3>Docs</h3>
    <p>Storybook can analyze your components to automatically create documentation alongside your stories. This automatic documentation makes it easier for you to create UI library usage guidelines, design system sites, and more.</p>
  </a>
  <a href="../writing-tests/" class="card card-large concept">
    <img src="/images/icons/icon-testing.svg" alt="" width="20" height="20" class="img" />
    <h3>Testing</h3>
    <p>Stories are a pragmatic starting point for your UI testing strategy. You already write stories as a natural part of UI development, so testing those stories is a low-effort way to prevent UI bugs over time.</p>
  </a>
  <a href="../sharing/" class="card card-large concept">
    <img src="/images/icons/icon-sharing.svg" alt="" width="20" height="20" class="img" />
    <h3>Sharing</h3>
    <p>Publishing your Storybook allows you to share your work with others. You can also embed your stories in places like Notion or Figma.</p>
  </a>
</div>

## Additional resources

Once you've learned the basics, explore these other ways to get the most out of Storybook.

<div class="sb-grid three-up">
  <a href="../essentials/" class="resource">
    <img src="/images/icons/icon-more.svg" width="28" height="28" alt="" class="img" />
    Essential addons
  </a>
  <a href="https://storybook.js.org/integrations/" class="resource">
    <img src="/images/icons/icon-more.svg" width="28" height="28" alt="" class="img" />
    Addon catalog
  </a>
  <a href="https://storybook.js.org/integrations/" class="resource">
    <img src="/images/icons/icon-more.svg" width="28" height="28" alt="" class="img" />
    Recipes
  </a>
  <a href="../builders/" class="resource">
    <img src="/images/icons/icon-more.svg" width="28" height="28" alt="" class="img" />
    Builders
  </a>
  <a href="../contribute/" class="resource">
    <img src="/images/icons/icon-more.svg" width="28" height="28" alt="" class="img" />
    How to contribute
  </a>
  <a href="../migration-guide/" class="resource">
    <img src="/images/icons/icon-more.svg" width="28" height="28" alt="" class="img" />
    Migrate to 8.0
  </a>
  <a href="../faq" class="resource">
    <img src="/images/icons/icon-more.svg" width="28" height="28" alt="" class="img" />
    FAQ
  </a>
</div>

---

<div class="sb-grid two-up">
  <div class="help">
    <h3>Need some help?</h3>
    <a href="https://github.com/storybookjs/storybook/discussions/categories/help">Join a discussion on GitHub<RightArrow /></a>
  </div>
  <div class="help">
    <h3>Latest product updates</h3>
    <a href="https://storybook.js.org/releases/">See changelog<RightArrow /></a>
  </div>
</div>

<style>
  {`
    .sb-grid {
      display: grid;
      gap: 16px;
    }

    .sb-grid.two-up {
      grid-template-columns: repeat(1, 1fr);
    }

    .sb-grid.three-up {
      grid-template-columns: repeat(1, 1fr);
    }

    @media (min-width: 440px) {
      .sb-grid.two-up {
        grid-template-columns: repeat(2, 1fr);
      }

      .sb-grid.three-up {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1280px) {
      .sb-grid.three-up {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    a.sb-grid-item.sb-grid-item.sb-grid-item {
      color: inherit;
      text-decoration: none;
    }

    .card {
      border-radius: 6px;
      border: 1px solid #D9E8F2;
      padding: 12px;
      transition: border-color 0.2s ease;
      color: inherit;
      text-decoration: none;
    }

    .card:hover {
      border-color: #B2C3CD;
    }

    .card h3 {
      font-size: 16px;
      font-weight: 600;
      line-height: 28px;
      margin: 0;
      color: #000;
      text-decoration: none;
    }

    .card p {
      font-size: 14px;
      line-height: 24px;
      margin: 0;
      color: #454E54;
      text-decoration: none;
    }

    .card.card-large {
      padding: 24px 28px;
    }

    .card.card-large h3 {
      font-size: 18px;
      font-weight: 700;
    }
    
    .framework {
      display: flex !important;
      flex-direction: row;
      align-items: center;
      height: 80px;
      gap: 12px;
      padding-left: 20px;
    }

    .framework h3 {
      line-height: 18px;
    }

    .concept {
      display: grid !important;
      grid-template-columns: auto 1fr;
      grid-template-rows: auto 1fr;
      gap: 12px;
      row-gap: 12px;
    }

    .concept .img {
      align-self: baseline;
      margin-top: 4px;
    }

    .concept p {
      grid-column: span 2;
    }

    .resource {
      display: flex !important;
      align-items: center;
      gap: 8px;
    }

    .help {
      margin-bottom: 24px;
    }

    .help h3 {
      margin-top: 0;
    }

    .help a {
      display: flex !important;
      align-items: center;
      gap: 4px;
    }
  `}
</style>
