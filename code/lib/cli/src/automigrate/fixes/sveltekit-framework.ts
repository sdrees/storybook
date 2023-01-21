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

interface SvelteKitFrameworkRunOptions {
  main: ConfigFile;
  packageJson: PackageJsonWithDepsAndDevDeps;
  dependenciesToRemove: string[];
}

const fixId = 'sveltekitFramework';

/**
 * Does the user have a SvelteKit project but is using a Svelte+Vite setup instead of the @storybook/sveltekit framework?
 *
 * If so:
 * - Remove the dependencies (@storybook/svelte-vite, @storybook/builder-vite, storybook-builder-vite)
 * - Add the dependencies (@storybook/sveltekit)
 * - Update the main config to use the new framework
 */
export const sveltekitFramework: Fix<SvelteKitFrameworkRunOptions> = {
  id: fixId,

  async check({ packageManager }) {
    const packageJson = packageManager.retrievePackageJson();
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (!allDeps['@sveltejs/kit']) {
      return null;
    }

    const { mainConfig, version: storybookVersion } = getStorybookInfo(packageJson);
    if (!mainConfig) {
      logger.warn('Unable to find storybook main.js config, skipping');
      return null;
    }

    const sbVersionCoerced = storybookVersion && semver.coerce(storybookVersion)?.version;
    if (!sbVersionCoerced) {
      throw new Error(dedent`
        ❌ Unable to determine storybook version.
        🤔 Are you running automigrate from your project directory?
      `);
    }

    if (!semver.gte(sbVersionCoerced, '7.0.0')) {
      return null;
    }

    const main = await readConfig(mainConfig);
    const framework = main.getNameFromPath(['framework']);

    if (!framework) {
      logger.warn(dedent`
      ❌ Unable to determine Storybook framework, skipping ${chalk.cyan(fixId)} fix.
      🤔 Are you running automigrate from your project directory?
    `);
      return null;
    }

    if (framework === '@storybook/sveltekit') {
      // already using the new framework
      return null;
    }

    if (framework === '@storybook/svelte-vite') {
      // direct migration from svelte-vite projects
      return {
        main,
        packageJson,
        dependenciesToRemove: ['@storybook/svelte-vite'],
      };
    }

    if (framework !== '@storybook/svelte') {
      // migration from projects using Svelte but with an unrecognized framework+builder setup - not supported
      logger.warn(dedent`
            We've detected you are using Storybook in a SvelteKit project.
      
            In Storybook 7, we introduced a new framework package for SvelteKit projects: @storybook/sveltekit.
      
            This package provides a better experience for SvelteKit users, however it is only compatible with the Svelte framework and the Vite builder, so we can't automigrate for you, as you are using another framework and builder combination.
            
            If you are interested in using this package, see: ${chalk.yellow(
              'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#sveltekit-needs-the-storybooksveltekit-framework'
            )}
          `);
      return null;
    }

    const builder = main.getFieldValue(['core', 'builder']);

    if (!['@storybook/builder-vite', 'storybook-builder-vite'].includes(builder)) {
      // migration from 6.x projects using Svelte with the Webpack builder - not supported
      logger.warn(dedent`
          We've detected you are using Storybook in a SvelteKit project.
    
          In Storybook 7, we introduced a new framework package for SvelteKit projects: @storybook/sveltekit.
    
          This package provides a better experience for SvelteKit users, however it is only compatible with the Vite builder, so we can't automigrate for you, as you are using another builder.
          
          If you are interested in using this package, see: ${chalk.yellow(
            'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#sveltekit-needs-the-storybooksveltekit-framework'
          )}
        `);

      return null;
    }

    // migration from 6.x projects using Svelte with the Vite builder
    return {
      main,
      packageJson,
      dependenciesToRemove: [builder],
    };
  },

  prompt() {
    return dedent`
      We've detected you are using Storybook in a SvelteKit project.

      In Storybook 7, we introduced a new framework package for SvelteKit projects: @storybook/sveltekit
      This package is a replacement for @storybook/svelte-vite and provides a better experience for SvelteKit users.

      We can automatically migrate your project to use the new SvelteKit framework package.

      To learn more about this change, see: ${chalk.yellow(
        'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#sveltekit-needs-the-storybooksveltekit-framework'
      )}
    `;
  },

  async run({ result: { main, packageJson, dependenciesToRemove }, packageManager, dryRun }) {
    logger.info(`✅ Removing redundant packages: ${dependenciesToRemove.join(', ')}`);
    if (!dryRun) {
      packageManager.removeDependencies({ skipInstall: true, packageJson }, dependenciesToRemove);
    }

    logger.info(`✅ Installing new dependencies: @storybook/sveltekit`);
    if (!dryRun) {
      const versionToInstall = getStorybookVersionSpecifier(packageJson);
      packageManager.addDependencies({ installAsDevDependencies: true, packageJson }, [
        `@storybook/sveltekit@${versionToInstall}`,
      ]);
    }

    logger.info(`✅ Updating framework field in main.js`);
    main.setFieldValue(['framework'], '@storybook/sveltekit');

    const currentCore = main.getFieldValue(['core']);
    if (currentCore.builder) {
      logger.info(`✅ Updating core field in main.js`);
      const { builder, ...core } = currentCore;

      if (Object.keys(core).length === 0) {
        main.removeField(['core']);
      } else {
        main.setFieldValue(['core'], core);
      }
    }

    if (main.getFieldNode(['svelteOptions'])) {
      logger.info(`✅ Removing svelteOptions field in main.js`);
      main.removeField(['svelteOptions']);
    }

    if (!dryRun) {
      await writeConfig(main);
    }
  },
};
