import { dedent } from 'ts-dedent';

const rendererNames = [
  '@storybook/html',
  '@storybook/preact',
  '@storybook/react',
  '@storybook/server',
  '@storybook/svelte',
  '@storybook/vue',
  '@storybook/vue3',
  '@storybook/web-components',
];

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
