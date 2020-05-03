import {
  retrievePackageJson,
  getVersionedPackages,
  writePackageJson,
  getBabelDependencies,
  installDependencies,
  copyTemplate,
} from '../../helpers';
import { STORY_FORMAT } from '../../project_types';

export default async (npmOptions, { storyFormat }) => {
  const packages = ['@storybook/html'];
  const versionedPackages = await getVersionedPackages(npmOptions, ...packages);
  if (storyFormat === STORY_FORMAT.MDX) {
    packages.push('@storybook/addon-docs');
  }

  copyTemplate(__dirname, storyFormat);

  const packageJson = await retrievePackageJson();

  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.devDependencies = packageJson.devDependencies || {};

  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts.storybook = 'start-storybook -p 6006';
  packageJson.scripts['build-storybook'] = 'build-storybook';

  writePackageJson(packageJson);

  const babelDependencies = await getBabelDependencies(npmOptions, packageJson);

  installDependencies({ ...npmOptions, packageJson }, [...versionedPackages, ...babelDependencies]);
};
