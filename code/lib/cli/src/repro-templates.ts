export type SkippableTask = 'smoke-test' | 'test-runner' | 'chromatic' | 'e2e-tests';
export type TemplateKey = keyof typeof allTemplates;
export type Cadence = keyof typeof templatesByCadence;
export type Template = {
  /**
   * Readable name for the template, which will be used for feedback and the status page
   */
  name: string;
  /**
   * Script used to generate the base project of a template.
   * The Storybook CLI will then initialize Storybook on top of that template.
   * This is used to generate projects which are pushed to https://github.com/storybookjs/repro-templates-temp
   */
  script: string;
  /**
   * Used to assert various things about the generated template.
   * If the template is generated with a different expected framework, it will fail, detecting a possible regression.
   */
  expected: {
    framework: string;
    renderer: string;
    builder: string;
  };

  expectedFailures?: Array<{
    feature: string;
    issues: string[];
  }>;

  unsupportedFeatures?: Array<{
    feature: string;
    issues: string[];
  }>;
  /**
   * Some sandboxes might not work properly in specific tasks temporarily, but we might
   * still want to run the other tasks. Set the ones to skip in this property.
   */
  skipTasks?: SkippableTask[];
  /**
   * Set this only while developing a newly created framework, to avoid using it in CI.
   * NOTE: Make sure to always add a TODO comment to remove this flag in a subsequent PR.
   */
  inDevelopment?: boolean;
};

export const allTemplates = {
  'cra/default-js': {
    name: 'Create React App (Javascript)',
    script: 'npx create-react-app .',
    expected: {
      // TODO: change this to @storybook/cra once that package is created
      framework: '@storybook/react-webpack5',
      renderer: '@storybook/react',
      builder: '@storybook/builder-webpack5',
    },
  },
  'cra/default-ts': {
    name: 'Create React App (Typescript)',
    script: 'npx create-react-app . --template typescript',
    // Re-enable once https://github.com/storybookjs/storybook/issues/19351 is fixed.
    skipTasks: ['smoke-test'],
    expected: {
      // TODO: change this to @storybook/cra once that package is created
      framework: '@storybook/react-webpack5',
      renderer: '@storybook/react',
      builder: '@storybook/builder-webpack5',
    },
  },
  'nextjs/12-js': {
    name: 'Next.js v12 (JavaScript)',
    script:
      'yarn create next-app {{beforeDir}} -e https://github.com/vercel/next.js/tree/next-12-3-2/examples/hello-world && cd {{beforeDir}} && npm pkg set "dependencies.next"="^12.2.0" && yarn && git add . && git commit --amend --no-edit && cd ..',
    expected: {
      framework: '@storybook/nextjs',
      renderer: '@storybook/react',
      builder: '@storybook/builder-webpack5',
    },
  },
  'nextjs/default-js': {
    name: 'Next.js (JavaScript)',
    script: 'yarn create next-app {{beforeDir}} --javascript --eslint',
    expected: {
      framework: '@storybook/nextjs',
      renderer: '@storybook/react',
      builder: '@storybook/builder-webpack5',
    },
  },
  'nextjs/default-ts': {
    name: 'Next.js (TypeScript)',
    script: 'yarn create next-app {{beforeDir}} --typescript --eslint',
    expected: {
      framework: '@storybook/nextjs',
      renderer: '@storybook/react',
      builder: '@storybook/builder-webpack5',
    },
  },
  'react-vite/default-js': {
    name: 'React Vite (JS)',
    script: 'yarn create vite . --template react',
    expected: {
      framework: '@storybook/react-vite',
      renderer: '@storybook/react',
      builder: '@storybook/builder-vite',
    },
  },
  'react-vite/default-ts': {
    name: 'React Vite (TS)',
    script: 'yarn create vite . --template react-ts',
    expected: {
      framework: '@storybook/react-vite',
      renderer: '@storybook/react',
      builder: '@storybook/builder-vite',
    },
  },
  'react-webpack/18-ts': {
    name: 'React Webpack5 (TS)',
    script: 'yarn create webpack5-react .',
    expected: {
      framework: '@storybook/react-webpack5',
      renderer: '@storybook/react',
      builder: '@storybook/builder-webpack5',
    },
  },
  'react-webpack/17-ts': {
    name: 'React Webpack5 (TS)',
    script: 'yarn create webpack5-react . --version-react="17" --version-react-dom="17"',
    expected: {
      framework: '@storybook/react-webpack5',
      renderer: '@storybook/react',
      builder: '@storybook/builder-webpack5',
    },
  },
  'vue3-vite/default-js': {
    name: 'Vue3 Vite (JS)',
    script: 'yarn create vite . --template vue',
    expected: {
      framework: '@storybook/vue3-vite',
      renderer: '@storybook/vue3',
      builder: '@storybook/builder-vite',
    },
  },
  'vue3-vite/default-ts': {
    name: 'Vue3 Vite (TS)',
    script: 'yarn create vite . --template vue-ts',
    expected: {
      framework: '@storybook/vue3-vite',
      renderer: '@storybook/vue3',
      builder: '@storybook/builder-vite',
    },
  },
  'vue2-vite/2.7-js': {
    name: 'Vue2 Vite (vue 2.7 JS)',
    // TODO: convert this to an `npm create` script, use that instead.
    // We don't really want to maintain weird custom scripts like this,
    // preferring community bootstrap scripts / generators instead.
    script:
      'yarn create vite . --template vanilla && yarn add --dev @vitejs/plugin-vue2 vue-template-compiler vue@2 && echo "import vue2 from \'@vitejs/plugin-vue2\';\n\nexport default {\n\tplugins: [vue2()]\n};" > vite.config.js',
    // Re-enable once https://github.com/storybookjs/storybook/issues/19351 is fixed.
    skipTasks: ['smoke-test'],
    expected: {
      framework: '@storybook/vue-vite',
      renderer: '@storybook/vue',
      builder: '@storybook/builder-vite',
    },
  },
  'html-webpack/default': {
    name: 'HTML Webpack5',
    script: 'yarn create webpack5-html .',
    expected: {
      framework: '@storybook/html-webpack5',
      renderer: '@storybook/html',
      builder: '@storybook/builder-webpack5',
    },
  },
  'html-vite/default-js': {
    name: 'HTML Vite JS',
    script: 'yarn create vite . --template vanilla && echo "export default {}" > vite.config.js',
    expected: {
      framework: '@storybook/html-vite',
      renderer: '@storybook/html',
      builder: '@storybook/builder-vite',
    },
    // TODO: remove this once html-vite framework is released
    inDevelopment: true,
  },
  'html-vite/default-ts': {
    name: 'HTML Vite TS',
    script: 'yarn create vite . --template vanilla-ts && echo "export default {}" > vite.config.js',
    expected: {
      framework: '@storybook/html-vite',
      renderer: '@storybook/html',
      builder: '@storybook/builder-vite',
    },
    // TODO: remove this once html-vite framework is released
    inDevelopment: true,
  },
  'svelte-vite/default-js': {
    name: 'Svelte Vite (JS)',
    script: 'yarn create vite . --template svelte',
    expected: {
      framework: '@storybook/svelte-vite',
      renderer: '@storybook/svelte',
      builder: '@storybook/builder-vite',
    },
  },
  'svelte-vite/default-ts': {
    name: 'Svelte Vite (TS)',
    script: 'yarn create vite . --template svelte-ts',
    // Re-enable once https://github.com/storybookjs/storybook/issues/19351 is fixed.
    skipTasks: ['smoke-test'],
    expected: {
      framework: '@storybook/svelte-vite',
      renderer: '@storybook/svelte',
      builder: '@storybook/builder-vite',
    },
  },
  'angular-cli/default-ts': {
    name: 'Angular CLI (latest)',
    script:
      'npx -p @angular/cli ng new angular-latest --directory . --routing=true --minimal=true --style=scss --strict --skip-git --skip-install --package-manager=yarn',
    expected: {
      framework: '@storybook/angular',
      renderer: '@storybook/angular',
      builder: '@storybook/builder-webpack5',
    },
  },
  'angular-cli/14-ts': {
    name: 'Angular CLI (Version 14)',
    script:
      'npx -p @angular/cli@14 ng new angular-v14 --directory . --routing=true --minimal=true --style=scss --strict --skip-git --skip-install --package-manager=yarn',
    expected: {
      framework: '@storybook/angular',
      renderer: '@storybook/angular',
      builder: '@storybook/builder-webpack5',
    },
  },
  'angular-cli/13-ts': {
    name: 'Angular CLI (Version 13)',
    script:
      'npx -p @angular/cli@13 ng new angular-v13 --directory . --routing=true --minimal=true --style=scss --strict --skip-git --skip-install --package-manager=yarn',
    expected: {
      framework: '@storybook/angular',
      renderer: '@storybook/angular',
      builder: '@storybook/builder-webpack5',
    },
  },
  'svelte-kit/skeleton-js': {
    name: 'Svelte Kit (JS)',
    script:
      'yarn create svelte-with-args --name=svelte-kit/skeleton-js --directory=. --template=skeleton --types=null --no-prettier --no-eslint --no-playwright --no-vitest',
    expected: {
      framework: '@storybook/sveltekit',
      renderer: '@storybook/svelte',
      builder: '@storybook/builder-vite',
    },
  },
  'svelte-kit/skeleton-ts': {
    name: 'Svelte Kit (TS)',
    script:
      'yarn create svelte-with-args --name=svelte-kit/skeleton-ts --directory=. --template=skeleton --types=typescript --no-prettier --no-eslint --no-playwright --no-vitest',
    expected: {
      framework: '@storybook/sveltekit',
      renderer: '@storybook/svelte',
      builder: '@storybook/builder-vite',
    },
  },
  'lit-vite/default-js': {
    name: 'Lit Vite (JS)',
    script: 'yarn create vite . --template lit',
    // Re-enable once https://github.com/storybookjs/storybook/issues/19351 is fixed.
    skipTasks: ['smoke-test'],
    expected: {
      framework: '@storybook/web-components-vite',
      renderer: '@storybook/web-components',
      builder: '@storybook/builder-vite',
    },
  },
  'lit-vite/default-ts': {
    name: 'Lit Vite (TS)',
    script: 'yarn create vite . --template lit-ts',
    // Re-enable once https://github.com/storybookjs/storybook/issues/19351 is fixed.
    skipTasks: ['smoke-test'],
    expected: {
      framework: '@storybook/web-components-vite',
      renderer: '@storybook/web-components',
      builder: '@storybook/builder-vite',
    },
  },
  'vue-cli/default-js': {
    name: 'Vue-CLI (Default JS)',
    script: 'npx -p @vue/cli vue create . --default --packageManager=yarn --force --merge',
    skipTasks: [
      // Re-enable once https://github.com/storybookjs/storybook/issues/19351 is fixed.
      'smoke-test',
    ],
    expected: {
      framework: '@storybook/vue3-webpack5',
      renderer: '@storybook/vue3',
      builder: '@storybook/builder-webpack5',
    },
  },
  'vue-cli/vue2-default-js': {
    name: 'Vue-CLI (Vue2 JS)',
    script:
      'npx -p @vue/cli vue create . --default --packageManager=yarn --force --merge --preset="Default (Vue 2)"',
    skipTasks: [
      // Re-enable once https://github.com/storybookjs/storybook/issues/19351 is fixed.
      'smoke-test',
    ],
    expected: {
      framework: '@storybook/vue-webpack5',
      renderer: '@storybook/vue',
      builder: '@storybook/builder-webpack5',
    },
  },
  'preact-webpack5/default-js': {
    name: 'Preact CLI (Default JS)',
    script: 'npx preact-cli create default {{beforeDir}} --name preact-app --yarn --no-install',
    expected: {
      framework: '@storybook/preact-webpack5',
      renderer: '@storybook/preact',
      builder: '@storybook/builder-webpack5',
    },
  },
  'preact-webpack5/default-ts': {
    name: 'Preact CLI (Default TS)',
    script: 'npx preact-cli create typescript {{beforeDir}} --name preact-app --yarn --no-install',
    expected: {
      framework: '@storybook/preact-webpack5',
      renderer: '@storybook/preact',
      builder: '@storybook/builder-webpack5',
    },
  },
} satisfies Record<string, Template>;

export const ci: TemplateKey[] = ['cra/default-ts', 'react-vite/default-ts'];
export const pr: TemplateKey[] = [
  ...ci,
  'angular-cli/default-ts',
  'vue3-vite/default-ts',
  'vue-cli/vue2-default-js',
  'lit-vite/default-ts',
  'svelte-vite/default-ts',
  'svelte-kit/skeleton-ts',
  'nextjs/default-ts',
];
export const merged: TemplateKey[] = [
  ...pr,
  'react-webpack/18-ts',
  'react-webpack/17-ts',
  'angular-cli/14-ts',
  'angular-cli/13-ts',
  'preact-webpack5/default-ts',
  'html-webpack/default',
];
export const daily: TemplateKey[] = [
  ...merged,
  'cra/default-js',
  'react-vite/default-js',
  'vue3-vite/default-js',
  'vue2-vite/2.7-js',
  'vue-cli/default-js',
  'lit-vite/default-js',
  'svelte-kit/skeleton-js',
  'svelte-vite/default-js',
  'nextjs/12-js',
  'nextjs/default-js',
  'preact-webpack5/default-js',
];

export const templatesByCadence = { ci, pr, merged, daily };
