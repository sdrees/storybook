import chalk from 'chalk';
import { dedent } from 'ts-dedent';

import type { ConfigFile } from '@storybook/csf-tools';
import { readConfig, writeConfig } from '@storybook/csf-tools';
import { getStorybookInfo } from '@storybook/core-common';

import type { Fix } from '../types';

const logger = console;

interface AutodocsTrueFrameworkRunOptions {
  main: ConfigFile;
}

/**
 * Set the docs.autodocs option to true if it isn't already set
 */
export const autodocsTrue: Fix<AutodocsTrueFrameworkRunOptions> = {
  id: 'autodocsTrue',

  async check({ packageManager }) {
    const packageJson = packageManager.retrievePackageJson();

    const { mainConfig } = getStorybookInfo(packageJson);

    if (!mainConfig) {
      logger.warn('Unable to find storybook main.js config, skipping');
      return null;
    }

    const main = await readConfig(mainConfig);
    const docs = main.getFieldValue(['docs']);

    return docs?.autodocs === undefined ? { main } : null;
  },

  prompt() {
    const AutodocsTrueFormatted = chalk.cyan(`docs: { autodocs: true }`);

    return dedent`
      We've detected that your main.js configuration file has not configured autodocs. In 6.x we
      we defaulted to having a autodocs for every story, in 7.x you need to opt in per-component.
      However, we can set the \`docs.autodocs\` to true to approximate the old behaviour:

      ${AutodocsTrueFormatted}

      More info: ${chalk.yellow(
        'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#autodocs'
      )}
    `;
  },

  async run({ result: { main }, dryRun }) {
    logger.info(`✅ Setting 'docs.autodocs' to true in main.js`);
    if (!dryRun) {
      main.setFieldValue(['docs', 'autodocs'], true);
      await writeConfig(main);
    }
  },
};
