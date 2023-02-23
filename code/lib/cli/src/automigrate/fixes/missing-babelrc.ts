import chalk from 'chalk';
import dedent from 'ts-dedent';
import semver from 'semver';
import { loadPartialConfigAsync } from '@babel/core';
import type { Fix } from '../types';
import { generateStorybookBabelConfigInCWD } from '../../babel-config';
import { getStorybookData } from '../helpers/mainConfigFile';

interface MissingBabelRcOptions {
  needsBabelRc: boolean;
}

const logger = console;

const frameworksThatNeedBabelConfig = [
  '@storybook/react-webpack5',
  '@storybook/vue-webpack5',
  '@storybook/vue3-webpack5',
  '@storybook/html-webpack5',
];

export const missingBabelRc: Fix<MissingBabelRcOptions> = {
  id: 'missing-babelrc',

  async check({ configDir, packageManager }) {
    const packageJson = packageManager.retrievePackageJson();
    const { mainConfig, storybookVersion } = await getStorybookData({ configDir, packageManager });

    if (!semver.gte(storybookVersion, '7.0.0')) {
      return null;
    }

    const { framework, addons } = mainConfig;

    const frameworkPackage = typeof framework === 'string' ? framework : framework.name;

    const hasCraPreset =
      addons && addons.find((addon) => addon === '@storybook/preset-create-react-app');

    if (
      frameworkPackage &&
      frameworksThatNeedBabelConfig.includes(frameworkPackage) &&
      !hasCraPreset
    ) {
      const config = await loadPartialConfigAsync({
        babelrc: true,
        filename: '__fake__.js', // somehow needed to detect .babelrc.* files
      });

      if (!config.config && !config.babelrc && !packageJson.babel) {
        return { needsBabelRc: true };
      }
    }

    return null;
  },
  prompt() {
    return dedent`
      We detected that your project does not have a babel configuration (.babelrc, babel.config.js, etc.).

      In version 6.x, Storybook provided its own babel settings out of the box. Now, Storybook re-uses ${chalk.bold(
        "your project's babel configuration"
      )}, with small, incremental updates from Storybook addons.

      If your project does not have a babel configuration file, we can generate one that's equivalent to the 6.x defaults for you. Keep in mind that this can affect your project if it uses babel, and you may need to make additional changes based on your projects needs.

      We can create a ${chalk.blue(
        '.babelrc.json'
      )} file with some basic configuration and add any necessary package devDependencies.

      Please see the migration guide for more information:
      ${chalk.yellow(
        'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#babel-mode-v7-exclusively'
      )}
    `;
  },
  async run() {
    logger.info();
    await generateStorybookBabelConfigInCWD();
  },
};
