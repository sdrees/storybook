import { dedent } from 'ts-dedent';
import semver from 'semver';
import chalk from 'chalk';
import type { Fix } from '../types';
import { isNxProject } from '../../helpers';
import { AngularJSON } from '../../generators/ANGULAR/helpers';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AngularBuildersMultiprojectRunOptions {}

export const angularBuildersMultiproject: Fix<AngularBuildersMultiprojectRunOptions> = {
  id: 'angular-builders-multiproject',
  promptOnly: true,

  async check({ packageManager, configDir }) {
    const packageJSON = packageManager.retrievePackageJson();

    // Skip in case of NX
    if (isNxProject(packageJSON)) {
      return null;
    }
    const allDependencies = packageManager.getAllDependencies();

    const angularVersion = allDependencies['@angular/core'];
    const angularCoerced = semver.coerce(angularVersion)?.version;

    // skip non-angular projects
    if (!angularCoerced) {
      return null;
    }

    // Is Angular version lower than 14? -> throw an error (only supports ng 14)
    if (semver.lt(angularCoerced, '14.0.0')) {
      return null;
    }

    const angularJSON = new AngularJSON();

    const { hasStorybookBuilder } = angularJSON;

    // skip if workspace has already one or more Storybook builder
    if (hasStorybookBuilder) {
      return null;
    }

    if (angularJSON.rootProject || Object.keys(angularJSON.projects).length === 1) {
      return null;
    }

    return {};
  },

  prompt() {
    return dedent`
    In Storybook 6.4 we have deprecated calling Storybook directly (npm run storybook) for Angular. In Storybook 7.0, we've removed it entirely. Instead you have to set up the Storybook builder in your ${chalk.yellow(
      'angular.json'
    )} and execute ${chalk.yellow('ng run <your-project>:storybook')} to start Storybook. 
    
    ❌ Your Angular workspace uses multiple projects defined in the ${chalk.yellow(
      'angular.json'
    )} file and we were not able to detect a root project. Therefore we are not able to automigrate to use Angular Storybook builder. Instead, please visit ${chalk.yellow(
      'https://github.com/storybookjs/storybook/tree/next/code/frameworks/angular'
    )} to do the migration manually.
    `;
  },
};
