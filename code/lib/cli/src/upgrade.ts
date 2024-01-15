import { sync as spawnSync } from 'cross-spawn';
import { telemetry, getStorybookCoreVersion } from '@storybook/telemetry';
import semver, { eq, lt, prerelease } from 'semver';
import { logger } from '@storybook/node-logger';
import { withTelemetry } from '@storybook/core-server';
import {
  UpgradeStorybookToLowerVersionError,
  UpgradeStorybookToSameVersionError,
} from '@storybook/core-events/server-errors';

import chalk from 'chalk';
import dedent from 'ts-dedent';
import boxen from 'boxen';
import type { PackageManagerName } from './js-package-manager';
import { JsPackageManagerFactory } from './js-package-manager';
import { coerceSemver, commandLog } from './helpers';
import { automigrate } from './automigrate';
import { isCorePackage } from './utils';
import versions from './versions';

type Package = {
  package: string;
  version: string;
};

const versionRegex = /(@storybook\/[^@]+)@(\S+)/;
export const getStorybookVersion = (line: string) => {
  if (line.startsWith('npm ')) return null;
  const match = versionRegex.exec(line);
  if (!match || !semver.clean(match[2])) return null;
  return {
    package: match[1],
    version: match[2],
  };
};

const deprecatedPackages = [
  {
    minVersion: '6.0.0-alpha.0',
    url: 'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#60-deprecations',
    deprecations: [
      '@storybook/addon-notes',
      '@storybook/addon-info',
      '@storybook/addon-contexts',
      '@storybook/addon-options',
      '@storybook/addon-centered',
    ],
  },
];

const formatPackage = (pkg: Package) => `${pkg.package}@${pkg.version}`;

const warnPackages = (pkgs: Package[]) =>
  pkgs.forEach((pkg) => logger.warn(`- ${formatPackage(pkg)}`));

export const checkVersionConsistency = () => {
  const lines = spawnSync('npm', ['ls'], { stdio: 'pipe', shell: true })
    .output.toString()
    .split('\n');
  const storybookPackages = lines
    .map(getStorybookVersion)
    .filter((item): item is NonNullable<typeof item> => !!item)
    .filter((pkg) => isCorePackage(pkg.package));
  if (!storybookPackages.length) {
    logger.warn('No storybook core packages found.');
    logger.warn(`'npm ls | grep storybook' can show if multiple versions are installed.`);
    return;
  }
  storybookPackages.sort((a, b) => semver.rcompare(a.version, b.version));
  const latestVersion = storybookPackages[0].version;
  const outdated = storybookPackages.filter((pkg) => pkg.version !== latestVersion);
  if (outdated.length > 0) {
    logger.warn(
      `Found ${outdated.length} outdated packages (relative to '${formatPackage(
        storybookPackages[0]
      )}')`
    );
    logger.warn('Please make sure your packages are updated to ensure a consistent experience.');
    warnPackages(outdated);
  }

  deprecatedPackages.forEach(({ minVersion, url, deprecations }) => {
    if (semver.gte(latestVersion, minVersion)) {
      const deprecated = storybookPackages.filter((pkg) => deprecations.includes(pkg.package));
      if (deprecated.length > 0) {
        logger.warn(`Found ${deprecated.length} deprecated packages since ${minVersion}`);
        logger.warn(`See ${url}`);
        warnPackages(deprecated);
      }
    }
  });
};

export interface UpgradeOptions {
  skipCheck: boolean;
  packageManager: PackageManagerName;
  dryRun: boolean;
  yes: boolean;
  disableTelemetry: boolean;
  configDir?: string;
}

export const doUpgrade = async ({
  skipCheck,
  packageManager: pkgMgr,
  dryRun,
  configDir,
  yes,
  ...options
}: UpgradeOptions) => {
  const packageManager = JsPackageManagerFactory.getPackageManager({ force: pkgMgr });

  const beforeVersion = await getStorybookCoreVersion();
  const currentVersion = versions['@storybook/cli'];
  const isCanary = currentVersion.startsWith('0.0.0');

  if (!isCanary && lt(currentVersion, beforeVersion)) {
    throw new UpgradeStorybookToLowerVersionError({ beforeVersion, currentVersion });
  }
  if (!isCanary && eq(currentVersion, beforeVersion)) {
    throw new UpgradeStorybookToSameVersionError({ beforeVersion });
  }

  const latestVersion = await packageManager.latestVersion('@storybook/cli');
  const isOutdated = lt(currentVersion, latestVersion);
  const isPrerelease = prerelease(currentVersion) !== null;

  const borderColor = isOutdated ? '#FC521F' : '#F1618C';

  const messages = {
    welcome: `Upgrading Storybook from version ${chalk.bold(beforeVersion)} to version ${chalk.bold(
      currentVersion
    )}..`,
    notLatest: chalk.red(dedent`
      This version is behind the latest release, which is: ${chalk.bold(latestVersion)}!
      You likely ran the upgrade command through npx, which can use a locally cached version, to upgrade to the latest version please run:
      ${chalk.bold('npx storybook@latest upgrade')}
      
      You may want to CTRL+C to stop, and run with the latest version instead.
    `),
    prelease: chalk.yellow('This is a pre-release version.'),
  };

  logger.plain(
    boxen(
      [messages.welcome]
        .concat(isOutdated && !isPrerelease ? [messages.notLatest] : [])
        .concat(isPrerelease ? [messages.prelease] : [])
        .join('\n'),
      { borderStyle: 'round', padding: 1, borderColor }
    )
  );

  const packageJson = await packageManager.retrievePackageJson();

  const toUpgradedDependencies = (deps: Record<string, any>) => {
    const monorepoDependencies = Object.keys(deps || {}).filter((dependency) => {
      // don't upgrade @storybook/preset-create-react-app if react-scripts is < v5
      if (dependency === '@storybook/preset-create-react-app') {
        const reactScriptsVersion =
          packageJson.dependencies['react-scripts'] ?? packageJson.devDependencies['react-scripts'];
        if (reactScriptsVersion && lt(coerceSemver(reactScriptsVersion), '5.0.0')) {
          return false;
        }
      }

      // only upgrade packages that are in the monorepo
      return dependency in versions;
    }) as Array<keyof typeof versions>;
    return monorepoDependencies.map((dependency) => {
      /* add ^ modifier to the version if this is the latest stable or prerelease version
         example outputs: @storybook/react@^8.0.0 */
      const maybeCaret = (!isOutdated || isPrerelease) && !isCanary ? '^' : '';
      return `${dependency}@${maybeCaret}${versions[dependency]}`;
    });
  };

  const upgradedDependencies = toUpgradedDependencies(packageJson.dependencies);
  const upgradedDevDependencies = toUpgradedDependencies(packageJson.devDependencies);

  if (!dryRun) {
    commandLog(`Updating dependencies in ${chalk.cyan('package.json')}..`);
    logger.plain('');
    if (upgradedDependencies.length > 0) {
      await packageManager.addDependencies(
        { installAsDevDependencies: false, skipInstall: true, packageJson },
        upgradedDependencies
      );
    }
    if (upgradedDevDependencies.length > 0) {
      await packageManager.addDependencies(
        { installAsDevDependencies: true, skipInstall: true, packageJson },
        upgradedDevDependencies
      );
    }
    await packageManager.installDependencies();
  }

  let automigrationResults;
  if (!skipCheck) {
    checkVersionConsistency();
    automigrationResults = await automigrate({ dryRun, yes, packageManager: pkgMgr, configDir });
  }
  if (!options.disableTelemetry) {
    const afterVersion = await getStorybookCoreVersion();
    const { preCheckFailure, fixResults } = automigrationResults || {};
    const automigrationTelemetry = {
      automigrationResults: preCheckFailure ? null : fixResults,
      automigrationPreCheckFailure: preCheckFailure || null,
    };
    telemetry('upgrade', {
      beforeVersion,
      afterVersion,
      ...automigrationTelemetry,
    });
  }
};

export async function upgrade(options: UpgradeOptions): Promise<void> {
  await withTelemetry('upgrade', { cliOptions: options }, () => doUpgrade(options));
}
