import chalk from 'chalk';
import { dedent } from 'ts-dedent';

import type { ConfigFile } from '@storybook/csf-tools';
import { readConfig, writeConfig } from '@storybook/csf-tools';
import { getStorybookInfo } from '@storybook/core-common';
import type { StorybookConfig } from '@storybook/types';

import type { Fix } from '../types';

const logger = console;

interface AutodocsTrueFrameworkRunOptions {
  main: ConfigFile;
  value?: StorybookConfig['docs']['autodocs'];
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

    const docsPageToAutodocsMapping = {
      true: 'tag' as const,
      automatic: true,
      false: false,
    };
    if (docs?.docsPage) {
      const oldValue = docs?.docsPage.toString();
      if (!(oldValue in docsPageToAutodocsMapping))
        throw new Error(`Unexpected value for docs.docsPage: ${oldValue}`);
      return {
        main,
        value: docsPageToAutodocsMapping[oldValue as keyof typeof docsPageToAutodocsMapping],
      };
    }

    return docs?.autodocs === undefined ? { main } : null;
  },

  prompt({ value }) {
    const autodocsFormatted = chalk.cyan(`docs: { autodocs: ${JSON.stringify(value ?? true)} }`);

    if (value) {
      return dedent`
      We've changed the configuration of autodocs (previous docsPage), so now the value:
        - docs.autodocs: true -- means automatically create docs for every CSF file
        - docs.autodocs: 'tag' -- means only create autodocs for CSF files with the 'autodocs' tag
        - docs.autodocs: false -- means never create autodocs

      Based on your prior configuration,  we can set the \`docs.autodocs\` to keep your old behaviour:

      ${autodocsFormatted}

      ${
        value === 'tag' &&
        `NOTE: it is important you change all CSF files to use the 'autodocs' tag rather than the 'docsPage' tag.`
      }

      More info: ${chalk.yellow(
        'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#autodocs'
      )}
    `;
    }

    return dedent`
      We've detected that your main.js configuration file has not configured autodocs. In 6.x we
      we defaulted to having a autodocs for every story, in 7.x you need to opt in per-component.
      However, we can set the \`docs.autodocs\` to true to approximate the old behaviour:

      ${autodocsFormatted}

      More info: ${chalk.yellow(
        'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#autodocs'
      )}
    `;
  },

  async run({ result: { main, value }, dryRun }) {
    logger.info(`✅ Setting 'docs.autodocs' to true in main.js`);
    if (!dryRun) {
      main.removeField(['docs', 'docsPage']);
      main.setFieldValue(['docs', 'autodocs'], value ?? true);
      await writeConfig(main);
    }
  },
};
