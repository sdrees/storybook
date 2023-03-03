import { join } from 'path';
import { dedent } from 'ts-dedent';
import { frameworkPackages } from './get-storybook-info';

const renderers = ['html', 'preact', 'react', 'server', 'svelte', 'vue', 'vue3', 'web-components'];

const rendererNames = [...renderers, ...renderers.map((renderer) => `@storybook/${renderer}`)];

export function validateFrameworkName(frameworkName: string | undefined) {
  const automigrateMessage = `Please run 'npx storybook@next automigrate' to automatically fix your config.

  See the migration guide for more information: 
  https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#new-framework-api\n`;

  // Throw error if there is no framework field
  // TODO: maybe this error should not be thrown if we allow empty Storybooks that only use "refs" for composition
  if (!frameworkName) {
    throw new Error(dedent`
      Could not find a 'framework' field in Storybook config.

      ${automigrateMessage}
    `);
  }

  // Account for legacy scenario where the framework was referring to a renderer
  if (rendererNames.includes(frameworkName)) {
    throw new Error(dedent`
      Invalid value of '${frameworkName}' in the 'framework' field of Storybook config.

      ${automigrateMessage}
    `);
  }

  // If we know about the framework, we don't need to validate it
  if (Object.keys(frameworkPackages).includes(frameworkName)) {
    return;
  }

  // If it's not a known framework, we need to validate that it's a valid package at least
  try {
    require.resolve(join(frameworkName, 'preset'));
  } catch (err) {
    throw new Error(dedent`
      Could not evaluate the ${frameworkName} package from the 'framework' field of Storybook config.

      Are you sure it's a valid package and is installed?`);
  }
}
