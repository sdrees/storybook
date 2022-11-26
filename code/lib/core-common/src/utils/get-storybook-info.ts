import path from 'path';
import fse from 'fs-extra';
import type { CoreCommon_StorybookInfo, PackageJson } from '@storybook/types';
import { getStorybookConfiguration } from './get-storybook-configuration';

const rendererPackages: Record<string, string> = {
  '@storybook/react': 'react',
  '@storybook/vue': 'vue',
  '@storybook/vue3': 'vue3',
  '@storybook/angular': 'angular',
  '@storybook/html': 'html',
  '@storybook/web-components': 'web-components',
  '@storybook/polymer': 'polymer',
  '@storybook/ember': 'ember',
  '@storybook/marko': 'marko',
  '@storybook/mithril': 'mithril',
  '@storybook/riot': 'riot',
  '@storybook/svelte': 'svelte',
  '@storybook/preact': 'preact',
  '@storybook/rax': 'rax',
  '@storybook/server': 'server',
};

const logger = console;

const findDependency = (
  { dependencies, devDependencies, peerDependencies }: PackageJson,
  predicate: (entry: [string, string | undefined]) => string
) => [
  Object.entries(dependencies || {}).find(predicate),
  Object.entries(devDependencies || {}).find(predicate),
  Object.entries(peerDependencies || {}).find(predicate),
];

const getRendererInfo = (packageJson: PackageJson) => {
  // Pull the viewlayer from dependencies in package.json
  const [dep, devDep, peerDep] = findDependency(packageJson, ([key]) => rendererPackages[key]);
  const [pkg, version] = dep || devDep || peerDep || [];
  const renderer = pkg ? rendererPackages[pkg] : undefined;

  if (dep && devDep && dep[0] === devDep[0]) {
    logger.warn(
      `Found "${dep[0]}" in both "dependencies" and "devDependencies". This is probably a mistake.`
    );
  }
  if (dep && peerDep && dep[0] === peerDep[0]) {
    logger.warn(
      `Found "${dep[0]}" in both "dependencies" and "peerDependencies". This is probably a mistake.`
    );
  }

  return {
    version,
    framework: renderer,
    frameworkPackage: pkg,
    renderer,
    rendererPackage: pkg,
  };
};

const validConfigExtensions = ['ts', 'js', 'tsx', 'jsx', 'mjs', 'cjs'];

const findConfigFile = (prefix: string, configDir: string) => {
  const filePrefix = path.join(configDir, prefix);
  const extension = validConfigExtensions.find((ext: string) =>
    fse.existsSync(`${filePrefix}.${ext}`)
  );
  return extension ? `${filePrefix}.${extension}` : null;
};

const getConfigInfo = (packageJson: PackageJson) => {
  let configDir = '.storybook';
  const storybookScript = packageJson.scripts?.['storybook'];
  if (storybookScript) {
    const configParam = getStorybookConfiguration(storybookScript, '-c', '--config-dir');
    if (configParam) configDir = configParam;
  }

  return {
    configDir,
    mainConfig: findConfigFile('main', configDir),
    previewConfig: findConfigFile('preview', configDir),
    managerConfig: findConfigFile('manager', configDir),
  };
};

export const getStorybookInfo = (packageJson: PackageJson) => {
  const rendererInfo = getRendererInfo(packageJson);
  const configInfo = getConfigInfo(packageJson);

  return {
    ...rendererInfo,
    ...configInfo,
  } as CoreCommon_StorybookInfo;
};
