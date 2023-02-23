import path from 'path';
import fs from 'fs';
import semver from 'semver';

import dedent from 'ts-dedent';
import { baseGenerator } from '../baseGenerator';
import type { Generator } from '../types';
import { CoreBuilder } from '../../project_types';
import versions from '../../versions';

const generator: Generator = async (packageManager, npmOptions, options) => {
  const monorepoRootPath = path.join(__dirname, '..', '..', '..', '..', '..', '..');
  const extraMain = options.linkable
    ? {
        webpackFinal: `%%(config) => {
      // add monorepo root as a valid directory to import modules from
      config.resolve.plugins.forEach((p) => {
        if (Array.isArray(p.appSrcs)) {
          p.appSrcs.push('${monorepoRootPath}');
              }
            });
          return config;
          }
    %%`,
      }
    : {};

  const craVersion = semver.coerce(
    packageManager.retrievePackageJson().dependencies['react-scripts']
  )?.version;
  const isCra5OrHigher = craVersion && semver.gte(craVersion, '5.0.0');
  const updatedOptions = isCra5OrHigher ? { ...options, builder: CoreBuilder.Webpack5 } : options;

  const extraPackages = [];
  if (isCra5OrHigher) {
    extraPackages.push('webpack');
    // Miscellaneous dependency used in `babel-preset-react-app` but not listed as dep there
    extraPackages.push('babel-plugin-named-exports-order');
    // Miscellaneous dependency to add to be sure Storybook + CRA is working fine with Yarn PnP mode
    extraPackages.push('prop-types');
  }

  const version = versions['@storybook/preset-create-react-app'];
  const extraAddons = [`@storybook/preset-create-react-app@${version}`];

  if (!isCra5OrHigher) {
    throw new Error(dedent`
      Storybook 7.0+ doesn't support react-scripts@<5.0.0.

      https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#create-react-app-dropped-cra4-support
    `);
  }

  await baseGenerator(packageManager, npmOptions, updatedOptions, 'react', {
    extraAddons,
    extraPackages,
    staticDir: fs.existsSync(path.resolve('./public')) ? 'public' : undefined,
    addBabel: false,
    addESLint: true,
    extraMain,
  });
};

export default generator;
