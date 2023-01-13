import chalk from 'chalk';
import dedent from 'ts-dedent';
import semver from 'semver';
import { getStorybookInfo } from '@storybook/core-common';
import { loadPartialConfigAsync } from '@babel/core';
import { readConfig } from '@storybook/csf-tools';
import type { Fix } from '../types';

interface MissingBabelRcOptions {
  needsBabelRc: boolean;
}

const logger = console;

const frameworksThatNeedBabelConfig = [
  '@storybook/react-webpack5',
  '@storybook/vue-webpack5',
  '@storybook/vue3-webpack5',
  '@storybook/preact-webpack5',
  '@storybook/html-webpack5',
];

export const missingBabelRc: Fix<MissingBabelRcOptions> = {
  id: 'missing-babelrc',
  promptOnly: true,

  async check({ packageManager }) {
    const packageJson = packageManager.retrievePackageJson();
    const { mainConfig, version: storybookVersion } = getStorybookInfo(packageJson);

    const storybookCoerced = storybookVersion && semver.coerce(storybookVersion)?.version;
    if (!storybookCoerced) {
      throw new Error(dedent`
        ❌ Unable to determine storybook version.
        🤔 Are you running automigrate from your project directory?
      `);
    }

    if (!semver.gte(storybookCoerced, '7.0.0')) {
      return null;
    }

    if (!mainConfig) {
      logger.warn('Unable to find storybook main.js config, skipping');
      return null;
    }

    const main = await readConfig(mainConfig);

    const frameworkField = main.getFieldValue(['framework']);
    const frameworkPackage =
      typeof frameworkField === 'string' ? frameworkField : frameworkField?.name;

    const addons: any[] = main.getFieldValue(['addons']) || [];

    const hasCraPreset = addons.find((addon) => {
      const name = typeof addon === 'string' ? addon : addon.name;
      return name === '@storybook/preset-create-react-app';
    });

    if (frameworksThatNeedBabelConfig.includes(frameworkPackage) && !hasCraPreset) {
      const config = await loadPartialConfigAsync({
        babelrc: true,
      });

      if (!config.config && !config.babelrc && !packageJson.babel) {
        return { needsBabelRc: true };
      }
    }

    return null;
  },
  prompt() {
    return dedent`
      ${chalk.bold(
        chalk.red('Attention')
      )}: We could not automatically make this change. You'll need to do it manually.

      We detected that your project does not have a babel configuration (.babelrc, babel.config.js, etc.).

      In version 6.x, Storybook provided its own babel settings out of the box. Now, Storybook re-uses your project's babel configuration, with small, incremental updates from Storybook addons.

      If your project does not have a babel configuration file, you can generate one that's equivalent to the 6.x defaults with the following command in your project directory:

      ${chalk.blue('npx storybook@next babelrc')}

      This will create a ${chalk.blue(
        '.babelrc.json'
      )} file with some basic configuration and add any necessary package devDependencies.

      Please see the migration guide for more information:
      ${chalk.yellow(
        'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#babel-mode-v7-exclusively'
      )}
    `;
  },
};
