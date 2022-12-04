import chalk from 'chalk';
import { dedent } from 'ts-dedent';

import type { ConfigFile } from '@storybook/csf-tools';
import { readConfig, writeConfig } from '@storybook/csf-tools';
import { getStorybookInfo } from '@storybook/core-common';

import type { Fix } from '../types';

const logger = console;

interface DocsPageAutomaticFrameworkRunOptions {
  main: ConfigFile;
}

/**
 * Set the docs.docsPage option to automatic if it isn't already set
 */
export const docsPageAutomatic: Fix<DocsPageAutomaticFrameworkRunOptions> = {
  id: 'docsPageAutomatic',

  async check({ packageManager }) {
    const packageJson = packageManager.retrievePackageJson();

    const { mainConfig } = getStorybookInfo(packageJson);

    if (!mainConfig) {
      logger.warn('Unable to find storybook main.js config, skipping');
      return null;
    }

    const main = await readConfig(mainConfig);
    const docs = main.getFieldValue(['docs']);

    return docs?.docsPage === undefined ? { main } : null;
  },

  prompt() {
    const docsPageAutomaticFormatted = chalk.cyan(`docs: { docsPage: 'automatic' }`);

    return dedent`
      We've detected that your main.js configuration file has not configured docsPage. In 6.x we
      we defaulted to having a docsPage for every story, in 7.x you need to opt in per-component.
      However, we can set the \`docs.docsPage\` to 'automatic' to approximate the old behaviour:

      ${docsPageAutomaticFormatted}

      More info: ${chalk.yellow(
        'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#docs-page'
      )}
    `;
  },

  async run({ result: { main }, dryRun }) {
    logger.info(`✅ Setting 'docs.docsPage' to 'automatic' in main.js`);
    if (!dryRun) {
      main.setFieldValue(['docs', 'docsPage'], 'automatic');
      await writeConfig(main);
    }
  },
};
