import chalk from 'chalk';
import dedent from 'ts-dedent';
import semver from 'semver';
import type { ConfigFile } from '@storybook/csf-tools';
import { readConfig, writeConfig } from '@storybook/csf-tools';
import { getStorybookInfo } from '@storybook/core-common';

import type { Fix } from '../types';
import type { PackageJsonWithDepsAndDevDeps } from '../../js-package-manager';
import { getStorybookVersionSpecifier } from '../../helpers';

const logger = console;

interface NextjsFrameworkRunOptions {
  main: ConfigFile;
  packageJson: PackageJsonWithDepsAndDevDeps;
  addonsToRemove: string[];
  frameworkOptions: Record<string, any>;
}

type Addon = string | { name: string; options?: Record<string, any> };

export const getNextjsAddonOptions = (addons: Addon[]) => {
  const nextjsAddon = addons?.find((addon) =>
    typeof addon === 'string'
      ? addon === 'storybook-addon-next'
      : addon.name === 'storybook-addon-next'
  );

  if (!nextjsAddon || typeof nextjsAddon === 'string') {
    return {};
  }

  return nextjsAddon.options || {};
};

/**
 * Does the user have a nextjs project but is not using the @storybook/nextjs framework package?
 *
 * If so:
 * - Remove the dependencies if webpack (@storybook/react-webpack5)
 * - Install the nextjs package (@storybook/nextjs)
 * - Uninstall existing legacy addons: storybook-addon-next and storybook-addon-next-router
 * - Update StorybookConfig type import (if it exists) from react-webpack5 to nextjs
 * - Update the main config to use the new framework
 * -- removing legacy addons: storybook-addon-next and storybook-addon-next-router
 * -- moving storybook-addon-next options into frameworkOptions
 */
export const nextjsFramework: Fix<NextjsFrameworkRunOptions> = {
  id: 'nextjsFramework',

  async check({ packageManager }) {
    const packageJson = packageManager.retrievePackageJson();
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (!allDeps.next) {
      return null;
    }

    const { mainConfig, version: storybookVersion } = getStorybookInfo(packageJson);
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

    if (!semver.gte(storybookCoerced, '7.0.0')) {
      return null;
    }

    const main = await readConfig(mainConfig);

    const frameworkPackage = main.getFieldValue(['framework']);

    if (!frameworkPackage) {
      return null;
    }

    const frameworkPackageName =
      typeof frameworkPackage === 'string' ? frameworkPackage : frameworkPackage.name;

    if (frameworkPackageName === '@storybook/react-vite') {
      logger.info(dedent`
        We've detected you are using Storybook in a Next.js project.

        In Storybook 7, we introduced a new framework package for Next.js projects: @storybook/nextjs.

        This package provides a better experience for Next.js users, however it is only compatible with the webpack 5 builder, so we can't automigrate for you, as you are using the Vite builder.
        
        If you are interested in using this package, see: ${chalk.yellow(
          'https://github.com/storybookjs/storybook/blob/next/code/frameworks/nextjs/README.md'
        )}
      `);

      return null;
    }

    // we only migrate from react-webpack5 projects
    if (frameworkPackageName !== '@storybook/react-webpack5') {
      return null;
    }

    const addonOptions = getNextjsAddonOptions(main.getFieldValue(['addons']));
    const frameworkOptions = main.getFieldValue(['framework', 'options']) || {};

    const addonsToRemove = ['storybook-addon-next', 'storybook-addon-next-router'].filter(
      (dep) => allDeps[dep]
    );

    return {
      main,
      addonsToRemove,
      frameworkOptions: {
        ...frameworkOptions,
        ...addonOptions,
      },
      packageJson,
    };
  },

  prompt({ addonsToRemove }) {
    let addonsMessage = '';

    if (addonsToRemove.length > 0) {
      addonsMessage = `
      This package also supports features provided by the following packages, which can now be removed:
      ${addonsToRemove.map((dep) => `- ${chalk.cyan(dep)}`).join(', ')}
      `;
    }

    return dedent`
      We've detected you are using Storybook in a ${chalk.bold('Next.js')} project.

      In Storybook 7, we introduced a new framework package for Next.js projects: ${chalk.magenta(
        '@storybook/nextjs'
      )}.

      This package is a replacement for ${chalk.magenta(
        '@storybook/react-webpack5'
      )} and provides a better experience for Next.js users.
      ${addonsMessage}
      To learn more about it, see: ${chalk.yellow(
        'https://github.com/storybookjs/storybook/blob/next/code/frameworks/nextjs/README.md'
      )}
    `;
  },

  async run({
    result: { addonsToRemove, main, frameworkOptions, packageJson },
    packageManager,
    dryRun,
  }) {
    const dependenciesToRemove = [...addonsToRemove, '@storybook/react-webpack5'];
    if (dependenciesToRemove.length > 0) {
      logger.info(`✅ Removing redundant packages: ${dependenciesToRemove.join(', ')}`);
      if (!dryRun) {
        packageManager.removeDependencies({ skipInstall: true, packageJson }, dependenciesToRemove);

        const existingAddons = main.getFieldValue(['addons']) as Addon[];
        const updatedAddons = existingAddons.filter((addon) => {
          if (typeof addon === 'string') {
            return !addonsToRemove.includes(addon);
          }

          if (addon.name) {
            return !addonsToRemove.includes(addon.name);
          }

          return false;
        });
        main.setFieldValue(['addons'], updatedAddons);
      }
    }

    logger.info(`✅ Installing new dependencies: @storybook/nextjs`);
    if (!dryRun) {
      const versionToInstall = getStorybookVersionSpecifier(packageJson);
      packageManager.addDependencies({ installAsDevDependencies: true, packageJson }, [
        `@storybook/nextjs@${versionToInstall}`,
      ]);
    }

    logger.info(`✅ Updating framework field in main.js`);
    if (!dryRun) {
      main.setFieldValue(['framework', 'options'], frameworkOptions);
      main.setFieldValue(['framework', 'name'], '@storybook/nextjs');

      await writeConfig(main);
    }
  },
};
