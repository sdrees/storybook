import chalk from 'chalk';
import { dedent } from 'ts-dedent';
import semver from 'semver';
import { getStorybookInfo } from '@storybook/core-common';
import { Fix } from '../types';
import { getStorybookVersionSpecifier } from '../../helpers';
import { PackageJsonWithDepsAndDevDeps } from '../../js-package-manager';

interface SbScriptsRunOptions {
  storybookScripts: {
    custom: Record<string, string>;
    official: Record<string, string>;
  };
  storybookVersion: string;
  packageJson: PackageJsonWithDepsAndDevDeps;
}

const logger = console;

export const getStorybookScripts = (scripts: Record<string, string>) => {
  const storybookScripts: SbScriptsRunOptions['storybookScripts'] = {
    custom: {},
    official: {},
  };

  Object.keys(scripts).forEach((key) => {
    if (key === 'storybook' || key === 'build-storybook') {
      storybookScripts.official[key] = scripts[key];
    } else if (scripts[key].match(/start-storybook/) || scripts[key].match(/build-storybook/)) {
      storybookScripts.custom[key] = scripts[key];
    }
  });

  return storybookScripts;
};

/**
 * Is the user using start-storybook
 *
 * If so:
 * - Add storybook dependency
 * - Change start-storybook and build-storybook scripts
 */
export const sbScripts: Fix<SbScriptsRunOptions> = {
  id: 'sb-scripts',

  async check({ packageManager }) {
    const packageJson = packageManager.retrievePackageJson();
    const { scripts = {}, devDependencies, dependencies } = packageJson;
    const { version: storybookVersion } = getStorybookInfo(packageJson);

    const allDeps = { ...dependencies, ...devDependencies };

    const storybookCoerced = storybookVersion && semver.coerce(storybookVersion)?.version;
    if (!storybookCoerced) {
      logger.warn(dedent`
        ❌ Unable to determine storybook version, skipping ${chalk.cyan('sb-scripts')} fix.
        🤔 Are you running automigrate from your project directory?
      `);
      return null;
    }

    if (allDeps.sb || allDeps.storybook) {
      return null;
    }

    const storybookScripts = getStorybookScripts(scripts);

    if (
      Object.keys(storybookScripts.official).length === 0 &&
      Object.keys(storybookScripts.custom).length === 0
    ) {
      return null;
    }

    Object.keys(storybookScripts.official).forEach((key) => {
      storybookScripts.official[key] = storybookScripts.official[key]
        .replace('start-storybook', 'storybook dev')
        .replace('build-storybook', 'storybook build');
    });

    return semver.gte(storybookCoerced, '7.0.0')
      ? { packageJson, storybookScripts, storybookVersion }
      : null;
  },

  prompt({ storybookVersion }) {
    const sbFormatted = chalk.cyan(`Storybook ${storybookVersion}`);

    const explanationMessage = [
      `Starting in Storybook 7, the ${chalk.yellow('start-storybook')} and ${chalk.yellow(
        'build-storybook'
      )} binaries have changed to ${chalk.magenta('storybook dev')} and ${chalk.magenta(
        'storybook build'
      )} respectively.`,
      `In order to work with ${sbFormatted}, Storybook's ${chalk.magenta(
        'storybook'
      )} binary has to be installed and your storybook scripts have to be adjusted to use the binary. We can install the storybook binary and attempt to adjust your scripts for you.`,
    ].join('\n');

    return [
      `We've detected you are using ${sbFormatted} with scripts from previous versions of Storybook.`,
      explanationMessage,
      `More info: ${chalk.yellow(
        'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#start-storybook--build-storybook-binaries-removed'
      )}`,
    ]
      .filter(Boolean)
      .join('\n\n');
  },

  async run({ result: { storybookScripts, packageJson }, packageManager, dryRun }) {
    logger.log();
    logger.info(`Adding 'storybook' as dev dependency`);
    logger.log();

    if (!dryRun) {
      const versionToInstall = getStorybookVersionSpecifier(packageJson);
      packageManager.addDependencies({ installAsDevDependencies: true }, [
        `storybook@${versionToInstall}`,
      ]);
    }

    logger.info(`Updating scripts in package.json`);
    logger.log();
    if (!dryRun && Object.keys(storybookScripts.official).length > 0) {
      const message = [
        `Migrating your scripts to:`,
        chalk.yellow(JSON.stringify(storybookScripts.official, null, 2)),
      ].join('\n');

      logger.log(message);
      logger.log();

      packageManager.addScripts(storybookScripts.official);
    }

    if (!dryRun && Object.keys(storybookScripts.custom).length > 0) {
      const message = [
        `We detected custom scripts that we can't automigrate:`,
        chalk.yellow(JSON.stringify(storybookScripts.custom, null, 2)),
        '\n',
        `Please manually migrate the ones applicable and use the documentation below for reference: ${chalk.yellow(
          'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#start-storybook--build-storybook-binaries-removed'
        )}`,
      ].join('\n');

      logger.log(message);
      logger.log();
    }
  },
};
