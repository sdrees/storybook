import chalk from 'chalk';
import { dedent } from 'ts-dedent';
import semver from 'semver';
import type { Fix } from '../types';
import { webpack5 } from './webpack5';
import { checkWebpack5Builder } from '../helpers/checkWebpack5Builder';

interface CRA5RunOptions {
  craVersion: string;
  // FIXME craPresetVersion: string;
  storybookVersion: string;
}

/**
 * Is the user upgrading from CRA4 to CRA5?
 *
 * If so:
 * - Run webpack5 fix
 */
export const cra5: Fix<CRA5RunOptions> = {
  id: 'cra5',

  async check({ packageManager, configDir }) {
    const allDependencies = packageManager.getAllDependencies();
    const craVersion = allDependencies['react-scripts'];
    const craCoerced = semver.coerce(craVersion)?.version;

    if (!craCoerced || semver.lt(craCoerced, '5.0.0')) {
      return null;
    }

    const builderInfo = await checkWebpack5Builder({ configDir, packageManager });
    return builderInfo ? { craVersion, ...builderInfo } : null;
  },

  prompt({ craVersion }) {
    const craFormatted = chalk.cyan(`Create React App (CRA) ${craVersion}`);

    return dedent`
      We've detected you are running ${craFormatted} which is powered by webpack5.
      Your Storybook's main.js files specifies webpack4, which is incompatible.

      In order to work with your version of CRA, we need to install Storybook's ${chalk.cyan(
        '@storybook/builder-webpack5'
      )}.

      More info: ${chalk.yellow(
        'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#cra5-upgrade'
      )}
    `;
  },

  async run(options) {
    return webpack5.run({
      ...options,
      result: { webpackVersion: null, ...options.result },
    });
  },
};
