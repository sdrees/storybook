import { getStorybookInfo } from '@storybook/core-common';
import { readConfig, writeConfig } from '@storybook/csf-tools';
import SemVer from 'semver';

import {
  JsPackageManagerFactory,
  useNpmWarning,
  type PackageManagerName,
} from './js-package-manager';
import { getStorybookVersion, isCorePackage } from './utils';

const logger = console;

interface PostinstallOptions {
  packageManager: PackageManagerName;
}

const postinstallAddon = async (addonName: string, options: PostinstallOptions) => {
  try {
    const modulePath = require.resolve(`${addonName}/postinstall`, { paths: [process.cwd()] });
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const postinstall = require(modulePath);

    try {
      logger.log(`Running postinstall script for ${addonName}`);
      await postinstall(options);
    } catch (e) {
      logger.error(`Error running postinstall script for ${addonName}`);
      logger.error(e);
    }
  } catch (e) {
    // no postinstall script
  }
};

const getVersionSpecifier = (addon: string) => {
  const groups = /^(...*)@(.*)$/.exec(addon);
  return groups ? [groups[1], groups[2]] : [addon, undefined];
};

/**
 * Install the given addon package and add it to main.js
 *
 * Usage:
 * - sb add @storybook/addon-docs
 * - sb add @storybook/addon-interactions@7.0.1
 *
 * If there is no version specifier and it's a storybook addon,
 * it will try to use the version specifier matching your current
 * Storybook install version.
 */
export async function add(
  addon: string,
  options: { useNpm: boolean; packageManager: PackageManagerName; skipPostinstall: boolean }
) {
  let { packageManager: pkgMgr } = options;
  if (options.useNpm) {
    useNpmWarning();
    pkgMgr = 'npm';
  }
  const packageManager = JsPackageManagerFactory.getPackageManager({ force: pkgMgr });
  const packageJson = await packageManager.retrievePackageJson();
  const [addonName, versionSpecifier] = getVersionSpecifier(addon);

  const { mainConfig } = getStorybookInfo(packageJson);
  if (!mainConfig) {
    logger.error('Unable to find storybook main.js config');
    return;
  }
  const main = await readConfig(mainConfig);
  logger.log(`Verifying ${addonName}`);
  const latestVersion = await packageManager.latestVersion(addonName);
  if (!latestVersion) {
    logger.error(`Unknown addon ${addonName}`);
  }

  // add to package.json
  const isStorybookAddon = addonName.startsWith('@storybook/');
  const isAddonFromCore = isCorePackage(addonName);
  const storybookVersion = await getStorybookVersion(packageManager);
  const version = versionSpecifier || (isAddonFromCore ? storybookVersion : latestVersion);
  const addonWithVersion = SemVer.valid(version)
    ? `${addonName}@^${version}`
    : `${addonName}@${version}`;
  logger.log(`Installing ${addonWithVersion}`);
  await packageManager.addDependencies({ installAsDevDependencies: true }, [addonWithVersion]);

  // add to main.js
  logger.log(`Adding '${addon}' to main.js addons field.`);
  main.appendValueToArray(['addons'], addonName);
  await writeConfig(main);

  if (!options.skipPostinstall && isStorybookAddon) {
    await postinstallAddon(addonName, { packageManager: packageManager.type });
  }
}
