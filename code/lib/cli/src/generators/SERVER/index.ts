import { CoreBuilder } from '../../project_types';
import { baseGenerator } from '../baseGenerator';
import type { Generator } from '../types';

const generator: Generator = async (packageManager, npmOptions, options) => {
  await baseGenerator(
    packageManager,
    npmOptions,
    { ...options, builder: CoreBuilder.Webpack5 },
    'server',
    {
      useSWC: () => true,
      extensions: ['json', 'yaml', 'yml'],
    }
  );
};

export default generator;
