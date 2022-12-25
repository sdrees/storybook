import type { Fix } from '../types';

import { cra5 } from './cra5';
import { webpack5 } from './webpack5';
import { angular12 } from './angular12';
import { vue3 } from './vue3';
import { mainjsFramework } from './mainjsFramework';
import { eslintPlugin } from './eslint-plugin';
import { builderVite } from './builder-vite';
import { sbScripts } from './sb-scripts';
import { sbBinary } from './sb-binary';
import { nextjsFramework } from './nextjs-framework';
import { newFrameworks } from './new-frameworks';
import { removedGlobalClientAPIs } from './remove-global-client-apis';
import { mdx1to2 } from './mdx-1-to-2';
import { autodocsTrue } from './autodocs-true';
import { sveltekitFramework } from './sveltekit-framework';
import { addReact } from './add-react';
import { nodeJsRequirement } from './nodejs-requirement';

export * from '../types';

export const fixes: Fix[] = [
  nodeJsRequirement,
  cra5,
  webpack5,
  angular12,
  vue3,
  mainjsFramework,
  eslintPlugin,
  sveltekitFramework,
  builderVite,
  sbBinary,
  sbScripts,
  newFrameworks,
  nextjsFramework,
  removedGlobalClientAPIs,
  mdx1to2,
  autodocsTrue,
  addReact,
];
