import type { Fix } from '../types';

import { cra5 } from './cra5';
import { webpack5 } from './webpack5';
import { vite4 } from './vite4';
import { vue3 } from './vue3';
import { mdxgfm } from './mdx-gfm';
import { eslintPlugin } from './eslint-plugin';
import { builderVite } from './builder-vite';
import { viteConfigFile } from './vite-config-file';
import { sbScripts } from './sb-scripts';
import { sbBinary } from './sb-binary';
import { newFrameworks } from './new-frameworks';
import { removedGlobalClientAPIs } from './remove-global-client-apis';
import { mdx1to2 } from './mdx-1-to-2';
import { autodocsTrue } from './autodocs-true';
import { angularBuilders } from './angular-builders';
import { incompatibleAddons } from './incompatible-addons';
import { angularBuildersMultiproject } from './angular-builders-multiproject';
import { wrapRequire } from './wrap-require';
import { reactDocgen } from './react-docgen';
import { removeReactDependency } from './prompt-remove-react';
import { storyshotsMigration } from './storyshots-migration';
import { removeArgtypesRegex } from './remove-argtypes-regex';
import { webpack5CompilerSetup } from './webpack5-compiler-setup';
import { removeJestTestingLibrary } from './remove-jest-testing-library';

export * from '../types';

export const allFixes: Fix[] = [
  newFrameworks,
  cra5,
  webpack5,
  vue3,
  vite4,
  viteConfigFile,
  eslintPlugin,
  builderVite,
  sbBinary,
  sbScripts,
  incompatibleAddons,
  removeArgtypesRegex,
  removeJestTestingLibrary,
  removedGlobalClientAPIs,
  mdx1to2,
  mdxgfm,
  autodocsTrue,
  angularBuildersMultiproject,
  angularBuilders,
  wrapRequire,
  reactDocgen,
  storyshotsMigration,
  removeReactDependency,
  webpack5CompilerSetup,
];

export const initFixes: Fix[] = [eslintPlugin];
