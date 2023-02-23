import { dedent } from 'ts-dedent';

const renderers = ['html', 'preact', 'react', 'server', 'svelte', 'vue', 'vue3', 'web-components'];

const rendererNames = [...renderers, ...renderers.map((renderer) => `@storybook/${renderer}`)];

// Checks that the framework name is not a renderer
export function validateFrameworkName(frameworkName: string) {
  if (rendererNames.includes(frameworkName)) {
    throw new Error(dedent`
      Invalid value of ${frameworkName} in the 'framework' field of Storybook config.

      Please run 'npx sb@next automigrate'

      See the v7 Migration guide for more information: 
      https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#framework-field-mandatory
      `);
  }
}
