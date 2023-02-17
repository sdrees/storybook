import fs from 'fs';
import findUp from 'find-up';
import semver from 'semver';
import { logger } from '@storybook/node-logger';

import { pathExistsSync } from 'fs-extra';
import { join } from 'path';
import type { TemplateConfiguration, TemplateMatcher } from './project_types';
import {
  ProjectType,
  supportedTemplates,
  SUPPORTED_RENDERERS,
  SupportedLanguage,
  unsupportedTemplate,
  CoreBuilder,
} from './project_types';
import { getBowerJson, paddedLog } from './helpers';
import type { JsPackageManager, PackageJson, PackageJsonWithMaybeDeps } from './js-package-manager';
import { detectWebpack } from './detect-webpack';

const viteConfigFiles = ['vite.config.ts', 'vite.config.js', 'vite.config.mjs'];

const hasDependency = (
  packageJson: PackageJsonWithMaybeDeps,
  name: string,
  matcher?: (version: string) => boolean
) => {
  const version = packageJson.dependencies?.[name] || packageJson.devDependencies?.[name];
  if (version && typeof matcher === 'function') {
    return matcher(version);
  }
  return !!version;
};

const hasPeerDependency = (
  packageJson: PackageJsonWithMaybeDeps,
  name: string,
  matcher?: (version: string) => boolean
) => {
  const version = packageJson.peerDependencies?.[name];
  if (version && typeof matcher === 'function') {
    return matcher(version);
  }
  return !!version;
};

type SearchTuple = [string, (version: string) => boolean | undefined];

const getFrameworkPreset = (
  packageJson: PackageJsonWithMaybeDeps,
  framework: TemplateConfiguration
): ProjectType | null => {
  const matcher: TemplateMatcher = {
    dependencies: [false],
    peerDependencies: [false],
    files: [false],
  };

  const { preset, files, dependencies, peerDependencies, matcherFunction } = framework;

  let dependencySearches = [] as SearchTuple[];
  if (Array.isArray(dependencies)) {
    dependencySearches = dependencies.map((name) => [name, undefined]);
  } else if (typeof dependencies === 'object') {
    dependencySearches = Object.entries(dependencies);
  }

  // Must check the length so the `[false]` isn't overwritten if `{ dependencies: [] }`
  if (dependencySearches.length > 0) {
    matcher.dependencies = dependencySearches.map(([name, matchFn]) =>
      hasDependency(packageJson, name, matchFn)
    );
  }

  let peerDependencySearches = [] as SearchTuple[];
  if (Array.isArray(peerDependencies)) {
    peerDependencySearches = peerDependencies.map((name) => [name, undefined]);
  } else if (typeof peerDependencies === 'object') {
    peerDependencySearches = Object.entries(peerDependencies);
  }

  // Must check the length so the `[false]` isn't overwritten if `{ peerDependencies: [] }`
  if (peerDependencySearches.length > 0) {
    matcher.peerDependencies = peerDependencySearches.map(([name, matchFn]) =>
      hasPeerDependency(packageJson, name, matchFn)
    );
  }

  if (Array.isArray(files) && files.length > 0) {
    matcher.files = files.map((name) => fs.existsSync(name));
  }

  return matcherFunction(matcher) ? preset : null;
};

export function detectFrameworkPreset(
  packageJson = {} as PackageJsonWithMaybeDeps
): ProjectType | null {
  const result = [...supportedTemplates, unsupportedTemplate].find((framework) => {
    return getFrameworkPreset(packageJson, framework) !== null;
  });

  return result ? result.preset : ProjectType.UNDETECTED;
}

/**
 * Attempts to detect which builder to use, by searching for a vite config file or webpack installation.
 * If neither are found it will choose the default builder based on the project type.
 *
 * @returns CoreBuilder
 */
export function detectBuilder(packageManager: JsPackageManager, projectType: ProjectType) {
  const viteConfig = findUp.sync(viteConfigFiles);
  if (viteConfig) {
    paddedLog('Detected Vite project. Setting builder to Vite');
    return CoreBuilder.Vite;
  }

  if (detectWebpack(packageManager)) {
    paddedLog('Detected webpack project. Setting builder to webpack');
    return CoreBuilder.Webpack5;
  }

  // Fallback to Vite or Webpack based on project type
  switch (projectType) {
    case ProjectType.SVELTE:
    case ProjectType.SVELTEKIT:
    case ProjectType.VUE:
    case ProjectType.VUE3:
    case ProjectType.SFC_VUE:
      return CoreBuilder.Vite;
    default:
      return CoreBuilder.Webpack5;
  }
}

export function isStorybookInstalled(
  dependencies: Pick<PackageJson, 'devDependencies'> | false,
  force?: boolean
) {
  if (!dependencies) {
    return false;
  }

  if (!force && dependencies.devDependencies) {
    if (
      SUPPORTED_RENDERERS.reduce(
        (storybookPresent, framework) =>
          storybookPresent || !!dependencies.devDependencies[`@storybook/${framework}`],
        false
      )
    ) {
      return true;
    }
  }
  return false;
}

export function detectPnp() {
  return pathExistsSync(join(process.cwd(), '.pnp.cjs'));
}

export function detectLanguage(packageJson?: PackageJson) {
  let language = SupportedLanguage.JAVASCRIPT;

  // TODO: we may need to also detect whether a jsconfig.json file is present
  // in a monorepo root directory
  if (!packageJson || fs.existsSync('jsconfig.json')) {
    return language;
  }

  if (
    hasDependency(packageJson, 'typescript', (version) =>
      semver.gte(semver.coerce(version), '4.9.0')
    ) &&
    (!hasDependency(packageJson, 'prettier') ||
      hasDependency(packageJson, 'prettier', (version) =>
        semver.gte(semver.coerce(version), '2.8.0')
      )) &&
    (!hasDependency(packageJson, '@babel/plugin-transform-typescript') ||
      hasDependency(packageJson, '@babel/plugin-transform-typescript', (version) =>
        semver.gte(semver.coerce(version), '7.20.0')
      )) &&
    (!hasDependency(packageJson, '@typescript-eslint/parser') ||
      hasDependency(packageJson, '@typescript-eslint/parser', (version) =>
        semver.gte(semver.coerce(version), '5.44.0')
      )) &&
    (!hasDependency(packageJson, 'eslint-plugin-storybook') ||
      hasDependency(packageJson, 'eslint-plugin-storybook', (version) =>
        semver.gte(semver.coerce(version), '0.6.8')
      ))
  ) {
    language = SupportedLanguage.TYPESCRIPT_4_9;
  } else if (
    hasDependency(packageJson, 'typescript', (version) =>
      semver.gte(semver.coerce(version), '3.8.0')
    )
  ) {
    language = SupportedLanguage.TYPESCRIPT_3_8;
  } else if (
    hasDependency(packageJson, 'typescript', (version) =>
      semver.lt(semver.coerce(version), '3.8.0')
    )
  ) {
    logger.warn('Detected TypeScript < 3.8, populating with JavaScript examples');
  }

  return language;
}

export function detect(
  packageJson: PackageJson,
  options: { force?: boolean; html?: boolean } = {}
) {
  const bowerJson = getBowerJson();

  if (!packageJson && !bowerJson) {
    return ProjectType.UNDETECTED;
  }

  if (isNxProject(packageJson)) {
    return ProjectType.NX;
  }

  if (options.html) {
    return ProjectType.HTML;
  }

  return detectFrameworkPreset(packageJson || bowerJson);
}

function isNxProject(packageJSON: PackageJson) {
  return !!packageJSON.devDependencies?.nx || fs.existsSync('nx.json');
}
