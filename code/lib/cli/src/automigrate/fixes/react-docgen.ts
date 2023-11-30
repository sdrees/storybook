import { dedent } from 'ts-dedent';
import { updateMainConfig } from '../helpers/mainConfigFile';
import type { Fix } from '../types';

const logger = console;

interface Options {
  reactDocgenTypescriptOptions: any;
}

/**
 */
export const reactDocgen: Fix<Options> = {
  id: 'react-docgen',

  async check({ mainConfig }) {
    // @ts-expect-error assume react
    const { reactDocgenTypescriptOptions } = mainConfig.typescript || {};

    return reactDocgenTypescriptOptions ? { reactDocgenTypescriptOptions } : null;
  },

  prompt() {
    return dedent`
      You have "typescript.reactDocgenTypescriptOptions" configured in your main.js,
      but "typescript.reactDocgen" is unset.
      
      In Storybook 8.0, we changed the default React docgen analysis from 
      "react-docgen-typescript" to "react-docgen", which dramatically faster
      but doesn't handle all TypeScript constructs.

      We can update your config to continue to use "react-docgen-typescript",
      though we recommend giving "react-docgen" for a much faster dev experience.

      https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#react-docgen-component-analysis-by-default
    `;
  },

  async run({ dryRun, mainConfigPath }) {
    if (!dryRun) {
      await updateMainConfig({ mainConfigPath, dryRun: !!dryRun }, async (main) => {
        logger.info(`✅ Setting typescript.reactDocgen`);
        if (!dryRun) {
          main.setFieldValue(['typescript', 'reactDocgen'], 'react-docgen-typescript');
        }
      });
    }
  },
};
