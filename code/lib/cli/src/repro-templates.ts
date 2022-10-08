const craTemplates = {
  'cra/default-js': {
    name: 'Create React App (Javascript)',
    script: 'npx create-react-app .',
    cadence: ['ci', 'daily', 'weekly'],
    expected: {
      framework: '@storybook/cra',
      renderer: '@storybook/react',
      builder: '@storybook/builder-webpack5',
    },
  },
  'cra/default-ts': {
    name: 'Create React App (Typescript)',
    script: 'npx create-react-app . --template typescript',
    cadence: ['ci', 'daily', 'weekly'],
    // Re-enable once https://github.com/storybookjs/storybook/issues/19351 is fixed.
    skipTasks: ['smoke-test'],
    expected: {
      framework: '@storybook/cra',
      renderer: '@storybook/react',
      builder: '@storybook/builder-webpack5',
    },
  },
};

const reactViteTemplates = {
  'react-vite/default-js': {
    name: 'React Vite (JS)',
    script: 'yarn create vite . --template react',
    cadence: ['ci', 'daily', 'weekly'],
    expected: {
      framework: '@storybook/react-vite',
      renderer: '@storybook/react',
      builder: '@storybook/builder-vite',
    },
  },
  'react-vite/default-ts': {
    name: 'React Vite (TS)',
    script: 'yarn create vite . --template react-ts',
    cadence: ['ci', 'daily', 'weekly'],
    expected: {
      framework: '@storybook/react-vite',
      renderer: '@storybook/react',
      builder: '@storybook/builder-vite',
    },
  },
};

const reactWebpackTemplates = {
  'react-webpack/18-ts': {
    name: 'React Webpack5 (TS)',
    script: 'yarn create webpack5-react .',
    cadence: ['ci', 'daily', 'weekly'],
    expected: {
      framework: '@storybook/react-webpack5',
      renderer: '@storybook/react',
      builder: '@storybook/builder-webpack5',
    },
  },
  'react-webpack/17-ts': {
    name: 'React Webpack5 (TS)',
    script: 'yarn create webpack5-react . --version-react="17" --version-react-dom="17"',
    cadence: ['ci', 'daily', 'weekly'],
    expected: {
      framework: '@storybook/react-webpack5',
      renderer: '@storybook/react',
      builder: '@storybook/builder-webpack5',
    },
  },
};

const vue3ViteTemplates = {
  'vue3-vite/default-js': {
    name: 'Vue3 Vite (JS)',
    script: 'yarn create vite . --template vue',
    cadence: ['ci', 'daily', 'weekly'],
    expected: {
      framework: '@storybook/vue3-vite',
      renderer: '@storybook/vue3',
      builder: '@storybook/builder-vite',
    },
  },
  'vue3-vite/default-ts': {
    name: 'Vue3 Vite (TS)',
    script: 'yarn create vite . --template vue-ts',
    cadence: ['ci', 'daily', 'weekly'],
    expected: {
      framework: '@storybook/vue3-vite',
      renderer: '@storybook/vue3',
      builder: '@storybook/builder-vite',
    },
  },
};

const vue2ViteTemplates = {
  'vue2-vite/2.7-js': {
    name: 'Vue2 Vite (vue 2.7 JS)',
    // TODO: convert this to an `npm create` script, use that instead.
    // We don't really want to maintain weird custom scripts like this,
    // preferring community bootstrap scripts / generators instead.
    script:
      'yarn create vite . --template vanilla && yarn add --dev @vitejs/plugin-vue2 vue-template-compiler vue@2 && echo "import vue2 from \'@vitejs/plugin-vue2\';\n\nexport default {\n\tplugins: [vue2()]\n};" > vite.config.js',
    cadence: ['ci', 'daily', 'weekly'],
    expected: {
      framework: '@storybook/vue2-vite',
      renderer: '@storybook/vue',
      builder: '@storybook/builder-vite',
    },
  },
};

const svelteViteTemplates = {
  'svelte-vite/default-js': {
    name: 'Svelte Vite (JS)',
    script: 'yarn create vite . --template svelte',
    cadence: ['ci', 'daily', 'weekly'],
    expected: {
      framework: '@storybook/svelte-vite',
      renderer: '@storybook/svelte',
      builder: '@storybook/builder-vite',
    },
  },
  'svelte-vite/default-ts': {
    name: 'Svelte Vite (TS)',
    script: 'yarn create vite . --template svelte-ts',
    cadence: ['ci', 'daily', 'weekly'],
    expected: {
      framework: '@storybook/svelte-vite',
      renderer: '@storybook/svelte',
      builder: '@storybook/builder-vite',
    },
  },
};

const litViteTemplates = {
  'lit-vite/default-js': {
    name: 'Lit Vite (JS)',
    script: 'yarn create vite . --template lit',
    cadence: [] as any,
    expected: {
      framework: '@storybook/web-components-vite',
      renderer: '@storybook/web-components',
      builder: '@storybook/builder-vite',
    },
  },
  'lit-vite/default-ts': {
    name: 'Lit Vite (TS)',
    script: 'yarn create vite . --template lit-ts',
    cadence: [] as any,
    expected: {
      framework: '@storybook/web-components-vite',
      renderer: '@storybook/web-components',
      builder: '@storybook/builder-vite',
    },
  },
};

const vueCliTemplates = {
  'vue-cli/default-js': {
    name: 'Vue-CLI (Default JS)',
    script: 'npx -p @vue/cli vue create . --default --packageManager=yarn --force --merge',
    cadence: ['ci', 'daily', 'weekly'],
    expected: {
      framework: '@storybook/vue3-webpack5',
      renderer: '@storybook/vue3',
      builder: '@storybook/builder-webpack5',
    },
  },
  'vue-cli/vue2-default-js': {
    name: 'Vue-CLI (Vue2 JS)',
    script:
      'npx -p @vue/cli vue create . --default --packageManager=yarn --force --merge --preset=Default\\ (Vue\\ 2)',
    cadence: ['ci', 'daily', 'weekly'],
    expected: {
      framework: '@storybook/vue-webpack5',
      renderer: '@storybook/vue',
      builder: '@storybook/builder-webpack5',
    },
  },
};

export default {
  ...craTemplates,
  ...reactWebpackTemplates,
  ...reactViteTemplates,
  ...vue2ViteTemplates,
  ...vue3ViteTemplates,
  ...svelteViteTemplates,
  ...litViteTemplates,
  ...vueCliTemplates,
  // FIXME: missing documentation.json
  // 'angular/latest': {
  //   name: 'Angular (latest)',
  //   script:
  //     'npx -p @angular/cli ng new angular-latest --directory . --routing=true --minimal=true --style=scss --skip-install=true --strict',
  //   cadence: ['ci', 'daily', 'weekly'],
  //   expected: {
  //     framework: '@storybook/angular',
  //     renderer: '@storybook/angular',
  //     builder: '@storybook/builder-webpack5',
  //   },
  // },
} as const;
