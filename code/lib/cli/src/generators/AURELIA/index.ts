import { join } from 'path';
import { writeFileAsJson, readFileAsJson, copyTemplate } from '../../helpers';
import { getCliDir } from '../../dirs';
import { baseGenerator } from '../baseGenerator';
import type { Generator } from '../types';

function addStorybookExcludeGlobToTsConfig() {
  const tsConfigJson = readFileAsJson('tsconfig.json', true);
  const glob = '**/*.stories.ts';
  if (!tsConfigJson) {
    return;
  }

  const { exclude = [] } = tsConfigJson;
  if (exclude.includes(glob)) {
    return;
  }

  tsConfigJson.exclude = [...exclude, glob];
  writeFileAsJson('tsconfig.json', tsConfigJson);
}

const generator: Generator = async (packageManager, npmOptions, options) => {
  addStorybookExcludeGlobToTsConfig();
  await baseGenerator(packageManager, npmOptions, options, 'aurelia', {
    extraPackages: ['aurelia'],
  });
  const templateDir = join(getCliDir(), 'templates', 'aurelia');
  copyTemplate(templateDir);
};

export default generator;
