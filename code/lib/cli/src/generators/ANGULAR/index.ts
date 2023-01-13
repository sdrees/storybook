import path, { join } from 'path';
import semver from 'semver';
import {
  checkForProjects,
  editStorybookTsConfig,
  getAngularAppTsConfigJson,
  getAngularAppTsConfigPath,
  getBaseTsConfigName,
} from './angular-helpers';
import { writeFileAsJson, copyTemplate } from '../../helpers';
import { getCliDir } from '../../dirs';
import { baseGenerator } from '../baseGenerator';
import type { Generator } from '../types';
import { CoreBuilder } from '../../project_types';

function editAngularAppTsConfig() {
  const tsConfigJson = getAngularAppTsConfigJson();
  const glob = '**/*.stories.*';
  if (!tsConfigJson) {
    return;
  }

  const { exclude = [] } = tsConfigJson;
  if (exclude.includes(glob)) {
    return;
  }

  tsConfigJson.exclude = [...exclude, glob];
  writeFileAsJson(getAngularAppTsConfigPath(), tsConfigJson);
}

const generator: Generator = async (packageManager, npmOptions, options) => {
  checkForProjects();

  const angularVersionFromDependencies = semver.coerce(
    packageManager.retrievePackageJson().dependencies['@angular/core']
  )?.version;

  const angularVersionFromDevDependencies = semver.coerce(
    packageManager.retrievePackageJson().devDependencies['@angular/core']
  )?.version;

  const angularVersion = angularVersionFromDependencies || angularVersionFromDevDependencies;
  const isWebpack5 = semver.gte(angularVersion, '12.0.0');
  const updatedOptions = isWebpack5 ? { ...options, builder: CoreBuilder.Webpack5 } : options;

  await baseGenerator(
    packageManager,
    npmOptions,
    updatedOptions,
    'angular',
    {
      extraPackages: ['@compodoc/compodoc'],
      addScripts: false,
    },
    'angular'
  );

  const templateDir = join(getCliDir(), 'templates', 'angular');
  copyTemplate(templateDir);

  editAngularAppTsConfig();

  // TODO: we need to add the following:

  /*
  "storybook": {
    "builder": "@storybook/angular:start-storybook",
    "options": {
      "browserTarget": "angular-cli:build",
      "port": 4400
    }
  },
  "build-storybook": {
    "builder": "@storybook/angular:build-storybook",
    "options": {
      "browserTarget": "angular-cli:build"
    }
  }
  */

  // to the user's angular.json file.

  // then we want to add these scripts to package.json
  // packageManager.addScripts({
  //   storybook: 'ng storybook',
  //   'build-storybook': 'ng build-storybook',
  // });

  editStorybookTsConfig(path.resolve('./.storybook/tsconfig.json'));

  // edit scripts to generate docs
  const tsConfigFile = await getBaseTsConfigName();
  packageManager.addScripts({
    'docs:json': `compodoc -p ./${tsConfigFile} -e json -d .`,
  });
  packageManager.addStorybookCommandInScripts({
    port: 6006,
    preCommand: 'docs:json',
  });
};

export default generator;
