import chalk from 'chalk';
import dedent from 'ts-dedent';
import { getStorybookInfo } from '@storybook/core-common';
import { readFile } from 'fs-extra';
import { Fix } from '../types';

export enum RemovedAPIs {
  addDecorator = 'addDecorator',
  addParameters = 'addParameters',
  addLoader = 'addLoader',
  getStorybook = 'getStorybook',
  setAddon = 'setAddon',
  clearDecorators = 'clearDecorators',
}

interface GlobalClientAPIOptions {
  usedAPIs: RemovedAPIs[];
  previewPath: string;
}

export const removedGlobalClientAPIs: Fix<GlobalClientAPIOptions> = {
  id: 'removedglobalclientapis',

  async check({ packageManager }) {
    const packageJson = packageManager.retrievePackageJson();

    const { previewConfig } = getStorybookInfo(packageJson);

    if (previewConfig) {
      const contents = await readFile(previewConfig, 'utf8');

      const usedAPIs = Object.values(RemovedAPIs).reduce((acc, item) => {
        if (contents.includes(item)) {
          acc.push(item);
        }
        return acc;
      }, [] as RemovedAPIs[]);

      if (usedAPIs.length) {
        return {
          usedAPIs,
          previewPath: previewConfig,
        };
      }
    }

    return null;
  },
  prompt({ usedAPIs, previewPath }) {
    return dedent`
      The following APIs (used in "${chalk.yellow(previewPath)}") have been removed from Storybook:
      ${usedAPIs.map(chalk.cyan).join(', ')}

      You'll need to update "${chalk.yellow(previewPath)}" manually.

      Please see the migration guide for more information:
      ${chalk.yellow(
        'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#removed-global-client-apis'
      )}
    `;
  },
  async run() {
    console.log('Skipping automatic fix for removed global client APIs');
  },
};
