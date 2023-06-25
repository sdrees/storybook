import type { PackageJson, StorybookConfig } from '@storybook/types';
import path from 'path';
import { frameworkPackages } from '@storybook/core-common';
import { cleanPaths } from './sanitize';
import { getActualPackageJson } from './package-json';

const knownRenderers = [
  'html',
  'react',
  'svelte',
  'vue3',
  'preact',
  'server',
  'vue',
  'web-components',
  'angular',
  'ember',
];

const knownBuilders = ['builder-webpack5', 'builder-vite'];

function findMatchingPackage(packageJson: PackageJson, suffixes: string[]) {
  const { name = '', version, dependencies, devDependencies, peerDependencies } = packageJson;

  const allDependencies = {
    // We include the framework itself because it may be a renderer too (e.g. angular)
    [name]: version,
    ...dependencies,
    ...devDependencies,
    ...peerDependencies,
  };

  return suffixes.map((suffix) => `@storybook/${suffix}`).find((pkg) => allDependencies[pkg]);
}

export const getFrameworkPackageName = (mainConfig?: StorybookConfig) => {
  const packageNameOrPath =
    typeof mainConfig?.framework === 'string' ? mainConfig.framework : mainConfig?.framework?.name;

  if (!packageNameOrPath) {
    return null;
  }

  const normalizedPath = path.normalize(packageNameOrPath).replace(new RegExp(/\\/, 'g'), '/');

  const knownFramework = Object.keys(frameworkPackages).find((pkg) => normalizedPath.endsWith(pkg));

  return knownFramework || cleanPaths(packageNameOrPath).replace(/.*node_modules[\\/]/, '');
};

export async function getFrameworkInfo(mainConfig: StorybookConfig) {
  if (!mainConfig.framework) return {};

  const frameworkName = getFrameworkPackageName(mainConfig);
  if (!frameworkName) return {};
  const frameworkOptions =
    typeof mainConfig.framework === 'object' ? mainConfig.framework.options : {};

  const frameworkPackageJson = await getActualPackageJson(frameworkName);

  const builder = findMatchingPackage(frameworkPackageJson, knownBuilders);
  const renderer = findMatchingPackage(frameworkPackageJson, knownRenderers);

  return {
    framework: {
      name: frameworkName,
      options: frameworkOptions,
    },
    builder,
    renderer,
  };
}
