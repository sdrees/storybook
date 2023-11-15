import { logger } from '@storybook/node-logger';
import dedent from 'ts-dedent';

export function ensureReactPeerDeps() {
  try {
    require.resolve('react');
    require.resolve('react-dom');
  } catch (e) {
    logger.error(dedent`
      Starting in 7.0, react and react-dom are now required peer dependencies of @storybook/addon-docs.
      https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#react-peer-dependencies-required

      You can continue to use Storybook without addon-docs, or you can install react and react-dom in your project:

      You can use the upgrade command in Storybook's CLI to automatically install the required
      peer dependencies for you.
      
      If you want to upgrade to the latest prerelease version, please run:

      $ npx storybook@next upgrade --prerelease

      Otherwise, please run:

      $ npx storybook upgrade

      If you do not want to use the upgrade commands, 
      please install react and react-dom in your project manually.

      npm:
      $ npm add react react-dom --dev

      yarn:
      $ yarn add react react-dom --dev

      pnpm:
      $ pnpm add react react-dom --dev
    `);
    process.exit(1);
  }
}
