import { dedent } from 'ts-dedent';
import semver from 'semver';
import type { StorybookConfig } from '@storybook/types';
import chalk from 'chalk';
import prompts from 'prompts';
import type { Fix } from '../types';
import { isNxProject } from '../../helpers';
import { AngularJSON } from '../../generators/ANGULAR/helpers';
import type { JsPackageManager } from '../../js-package-manager';
import { getFrameworkPackageName } from '../helpers/mainConfigFile';

interface AngularBuildersRunOptions {
  mainConfig: StorybookConfig;
  packageManager: JsPackageManager;
}

export const angularBuilders: Fix<AngularBuildersRunOptions> = {
  id: 'angular-builders',

  async check({ packageManager, mainConfig }) {
    const angularVersion = await packageManager.getPackageVersion('@angular/core');

    const framewworkPackageName = getFrameworkPackageName(mainConfig);

    // Skip in case of NX
    if (
      !angularVersion ||
      (await isNxProject()) ||
      framewworkPackageName !== '@storybook/angular'
    ) {
      return null;
    }

    if (semver.lt(angularVersion, '14.0.0')) {
      throw new Error(dedent`
      ❌ Your project uses Angular < 14.0.0. Storybook 7.0 for Angular requires Angular 14.0.0 or higher. 
      Please upgrade your Angular version to at least version 14.0.0 to use Storybook 7.0 in your project.
      `);
    }

    const angularJSON = new AngularJSON();

    const { hasStorybookBuilder } = angularJSON;

    // skip if workspace has already one or more Storybook builder
    if (hasStorybookBuilder) {
      return null;
    }

    if (!angularJSON.rootProject && Object.keys(angularJSON.projects).length > 1) {
      return null;
    }

    return {
      mainConfig,
      packageManager,
    };
  },

  prompt() {
    return dedent`
      We have detected that your project does not use the Storybook Angular builder yet. In Storybook 6.4 we deprecated calling Storybook directly (npm run storybook) for Angular. In Storybook 7.0, we've removed it entirely.
      
      In order to use the Storybook Angular builder, we need to add a few entries to your angular.json file. Additionally, we will add the @compodoc/compodoc package to your devDependencies if you want and we will add a few scripts to your package.json file.

      Also feel free to remove the Compodoc script from your package.json file if you don't use it apart from Storybook anymore. Storybook uses Compodoc internally and you don't have to call in separately anymore.

      Read more about the Angular builder here: ${chalk.yellow(
        'https://github.com/storybookjs/storybook/tree/next/code/frameworks/angular#how-do-i-migrate-to-an-angular-storybook-builder'
      )}
    `;
  },

  async run({ result }) {
    const angularJSON = new AngularJSON();
    const { packageManager } = result;

    const { useCompoDoc } = await prompts({
      type: 'confirm',
      name: 'useCompoDoc',
      message: 'Have you set up compodoc in Storybook previously?',
    });

    const angularProjectName = await angularJSON.getProjectName();

    angularJSON.addStorybookEntries({
      angularProjectName,
      storybookFolder: '.storybook',
      useCompodoc: useCompoDoc,
      root: '.',
    });

    angularJSON.write();

    await packageManager.addScripts({
      storybook: `ng run ${angularProjectName}:storybook`,
      'build-storybook': `ng run ${angularProjectName}:build-storybook`,
    });
  },
};
