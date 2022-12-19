import chalk from 'chalk';
import { dedent } from 'ts-dedent';
import semver from 'semver';
import { getStorybookInfo } from '@storybook/core-common';
import type { Fix } from '../types';
import { getStorybookVersionSpecifier } from '../../helpers';
import type { PackageJsonWithDepsAndDevDeps } from '../../js-package-manager';

interface SbBinaryRunOptions {
  storybookVersion: string;
  hasSbBinary: boolean;
  hasStorybookBinary: boolean;
  packageJson: PackageJsonWithDepsAndDevDeps;
}

const logger = console;

/**
 * Does the user not have storybook dependency?
 *
 * If so:
 * - Add storybook dependency
 * - If they are using sb dependency, remove it
 */
export const sbBinary: Fix<SbBinaryRunOptions> = {
  id: 'storybook-binary',

  async check({ packageManager }) {
    const packageJson = packageManager.retrievePackageJson();
    const { devDependencies, dependencies } = packageJson;
    const { version: storybookVersion } = getStorybookInfo(packageJson);

    const allDeps = { ...dependencies, ...devDependencies };

    const storybookCoerced = storybookVersion && semver.coerce(storybookVersion)?.version;
    if (!storybookCoerced) {
      throw new Error(dedent`
        ❌ Unable to determine storybook version.
        🤔 Are you running automigrate from your project directory?
      `);
    }

    if (semver.lt(storybookCoerced, '7.0.0')) {
      return null;
    }

    const hasSbBinary = !!allDeps.sb;
    const hasStorybookBinary = !!allDeps.storybook;

    if (!hasSbBinary && hasStorybookBinary) {
      return null;
    }

    return {
      hasSbBinary,
      hasStorybookBinary,
      storybookVersion,
      packageJson,
    };
  },

  prompt({ storybookVersion, hasSbBinary, hasStorybookBinary }) {
    const sbFormatted = chalk.cyan(`Storybook ${storybookVersion}`);

    const storybookBinaryMessage = !hasStorybookBinary
      ? `We've detected you are using ${sbFormatted} without Storybook's ${chalk.magenta(
          'storybook'
        )} binary. Starting in Storybook 7.0, it has to be installed.`
      : '';

    const extraMessage = hasSbBinary
      ? "You're using the 'sb' binary and it should be replaced, as 'storybook' is the recommended way to run Storybook.\n"
      : '';

    return dedent`
      ${storybookBinaryMessage}
      ${extraMessage}

      More info: ${chalk.yellow(
        'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#start-storybook--build-storybook-binaries-removed'
      )}
      `;
  },

  async run({ result: { packageJson, hasSbBinary, hasStorybookBinary }, packageManager, dryRun }) {
    if (hasSbBinary) {
      logger.info(`✅ Removing 'sb' dependency`);
      if (!dryRun) {
        packageManager.removeDependencies({ skipInstall: !hasStorybookBinary, packageJson }, [
          'sb',
        ]);
      }
    }

    if (!hasStorybookBinary) {
      logger.log();
      logger.info(`✅ Adding 'storybook' as dev dependency`);
      logger.log();
      if (!dryRun) {
        const versionToInstall = getStorybookVersionSpecifier(packageJson);
        packageManager.addDependencies({ installAsDevDependencies: true }, [
          `storybook@${versionToInstall}`,
        ]);
      }
    }
  },
};
