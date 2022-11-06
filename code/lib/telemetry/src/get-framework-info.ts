import type { PackageJson, StorybookConfig } from '@storybook/types';
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

export async function getFrameworkInfo(mainConfig: StorybookConfig) {
  const { framework: frameworkInput } = mainConfig;

  if (!frameworkInput) return {};

  const framework = typeof frameworkInput === 'string' ? { name: frameworkInput } : frameworkInput;

  const frameworkPackageJson = await getActualPackageJson(framework.name);

  const builder = findMatchingPackage(frameworkPackageJson, knownBuilders);
  const renderer = findMatchingPackage(frameworkPackageJson, knownRenderers);

  return {
    framework,
    builder,
    renderer,
  };
}
