import chalk from 'chalk';
import semver from 'semver';
import { frameworkPackages } from '@storybook/core-common';
import type { InstallationMetadata } from '../js-package-manager/types';
import storybookCorePackages from '../versions';

function getPrimaryVersion(name: string, installationMetadata?: InstallationMetadata) {
  const packageMetadata = installationMetadata?.dependencies[name];
  if (!packageMetadata) {
    return undefined;
  }

  return packageMetadata[0]?.version;
}

export function getMismatchingVersionsWarnings(
  installationMetadata?: InstallationMetadata,
  allDependencies?: Record<string, string>
): string | undefined {
  const messages: string[] = [];
  try {
    const frameworkPackageName = Object.keys(installationMetadata?.dependencies).find(
      (packageName) => {
        return Object.keys(frameworkPackages).includes(packageName);
      }
    );
    const cliVersion = getPrimaryVersion('@storybook/cli', installationMetadata);
    const frameworkVersion = getPrimaryVersion(frameworkPackageName, installationMetadata);

    if (!cliVersion || !frameworkVersion || semver.eq(cliVersion, frameworkVersion)) {
      return undefined;
    }

    messages.push(
      `${chalk.bold(
        'Attention:'
      )} There seems to be a mismatch between your Storybook package versions. This can result in a broken Storybook installation.`
    );

    let versionToCompare: string;
    let packageToDisplay: string;
    if (semver.lt(cliVersion, frameworkVersion)) {
      versionToCompare = frameworkVersion;
      packageToDisplay = frameworkPackageName;
    } else {
      versionToCompare = cliVersion;
      packageToDisplay = 'storybook';
    }

    messages.push(
      `The version of your storybook core packages should align with ${chalk.yellow(
        versionToCompare
      )} (from the ${chalk.cyan(packageToDisplay)} package) or higher.`
    );

    const filteredDependencies = Object.entries(installationMetadata?.dependencies).filter(
      ([name, packages]) => {
        if (Object.keys(storybookCorePackages).includes(name)) {
          const packageVersion = packages[0].version;
          return packageVersion !== versionToCompare;
        }

        return false;
      }
    );

    if (filteredDependencies.length > 0) {
      messages.push(
        `Based on your lockfile, these dependencies should be upgraded:`,
        filteredDependencies
          .map(
            ([name, dep]) =>
              `${chalk.hex('#ff9800')(name)}: ${dep[0].version} ${
                allDependencies[name] ? '(in your package.json)' : ''
              }`
          )
          .join('\n')
      );
    }

    messages.push(
      `You can run ${chalk.cyan(
        'npx storybook@latest upgrade'
      )} to upgrade all of your Storybook packages to the latest version.
      
      Alternatively you can try manually changing the versions to match in your package.json. We also recommend regenerating your lockfile, or running the following command to possibly deduplicate your Storybook package versions: ${chalk.cyan(
        installationMetadata.dedupeCommand
      )}`
    );

    return messages.join('\n\n');
  } catch (err) {
    return undefined;
  }
}
