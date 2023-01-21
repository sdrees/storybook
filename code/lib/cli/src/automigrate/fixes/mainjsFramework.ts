import chalk from 'chalk';
import { dedent } from 'ts-dedent';

import semver from 'semver';
import type { ConfigFile } from '@storybook/csf-tools';
import { readConfig, writeConfig } from '@storybook/csf-tools';
import { getStorybookInfo } from '@storybook/core-common';

import type { Fix } from '../types';

const logger = console;

interface MainjsFrameworkRunOptions {
  framework: string;
  main: ConfigFile;
}

export const mainjsFramework: Fix<MainjsFrameworkRunOptions> = {
  id: 'mainjsFramework',

  async check({ packageManager }) {
    const packageJson = packageManager.retrievePackageJson();

    // FIXME: use renderer in SB7?
    const { mainConfig, framework, version: storybookVersion } = getStorybookInfo(packageJson);

    if (!mainConfig) {
      logger.warn('Unable to find storybook main.js config, skipping');
      return null;
    }

    const storybookCoerced = storybookVersion && semver.coerce(storybookVersion)?.version;
    if (!storybookCoerced) {
      throw new Error(dedent`
        ❌ Unable to determine storybook version.
        🤔 Are you running automigrate from your project directory?
      `);
    }

    const main = await readConfig(mainConfig);
    const currentFramework = main.getFieldNode(['framework']);
    const features = main.getFieldValue(['features']);

    if (currentFramework) return null;

    return features?.breakingChangesV7 ||
      features?.storyStoreV7 ||
      semver.gte(storybookCoerced, '7.0.0')
      ? { main, framework: `@storybook/${framework}` }
      : null;
  },

  prompt({ framework }) {
    const frameworkFormatted = chalk.cyan(`framework: '${framework}'`);

    return dedent`
      We've detected that your main.js configuration file does not specify the
      'framework' field, which is a requirement in SB7.0 and above. We can add one
      for you automatically:

      ${frameworkFormatted}

      More info: ${chalk.yellow(
        'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#mainjs-framework-field'
      )}
    `;
  },

  async run({ result: { main, framework }, dryRun }) {
    logger.info(`✅ Setting 'framework' to '${framework}' in main.js`);
    if (!dryRun) {
      main.setFieldValue(['framework'], framework);
      await writeConfig(main);
    }
  },
};
