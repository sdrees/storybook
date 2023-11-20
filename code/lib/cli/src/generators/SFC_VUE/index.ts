import { CoreBuilder } from '../../project_types';
import { baseGenerator } from '../baseGenerator';
import type { Generator } from '../types';

const generator: Generator = async (packageManager, npmOptions, options) => {
  await baseGenerator(packageManager, npmOptions, options, 'vue', {
    useSWC: ({ builder }) => builder === CoreBuilder.Webpack5,
  });
};

export default generator;
