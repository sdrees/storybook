import chalk from 'chalk';
import { dedent } from 'ts-dedent';
import semver from 'semver';
import type { Fix } from '../types';

const logger = console;

interface Vite4RunOptions {
  viteVersion: string | null;
}

export const vite4 = {
  id: 'vite4',

  async check({ packageManager }) {
    const viteVersion = await packageManager.getPackageVersion('vite');

    if (!viteVersion || semver.gt(viteVersion, '4.0.0')) {
      return null;
    }

    return { viteVersion };
  },

  prompt({ viteVersion: viteVersion }) {
    const viteFormatted = chalk.cyan(`${viteVersion}`);

    return dedent`
      We've detected your version of Vite is outdated (${viteFormatted}).

      Storybook 8.0.0 will require Vite 4.0.0 or later.
      Do you want us to upgrade Vite for you?
    `;
  },

  async run({ packageManager, dryRun }) {
    const deps = [`vite`];
    logger.info(`✅ Adding dependencies: ${deps}`);
    if (!dryRun) {
      await packageManager.addDependencies({ installAsDevDependencies: true }, deps);
    }
  },
} satisfies Fix<Vite4RunOptions>;
