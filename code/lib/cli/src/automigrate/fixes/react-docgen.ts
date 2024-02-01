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
      "react-docgen-typescript" to "react-docgen". We recommend "react-docgen"
      for most projects, since it is dramatically faster. However, it doesn't
      handle all TypeScript constructs, and may generate different results
      than "react-docgen-typescript".
      
      Should we update your config to continue to use "react-docgen-typescript"?

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
