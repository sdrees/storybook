import { join } from 'path';
import { existsSync } from 'fs';
import { CoreBuilder } from '../../project_types';
import { baseGenerator } from '../baseGenerator';
import type { Generator } from '../types';

const generator: Generator = async (packageManager, npmOptions, options) => {
  let staticDir;
  if (existsSync(join(process.cwd(), 'public'))) staticDir = 'public';

  await baseGenerator(
    packageManager,
    npmOptions,
    { ...options, builder: CoreBuilder.Webpack5 },
    'react',
    {
      staticDir,
      extraAddons: [`@storybook/addon-onboarding`],
      webpackCompiler: ({ builder }) => undefined,
    },
    'nextjs'
  );
};

export default generator;
