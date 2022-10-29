import { CoreBuilder } from '../../project_types';
import { baseGenerator } from '../baseGenerator';
import type { Generator } from '../types';

const generator: Generator = async (packageManager, npmOptions, options) => {
  const extraPackages = options.builder === CoreBuilder.Webpack5 ? ['vue-loader@^15.7.0'] : [];
  await baseGenerator(packageManager, npmOptions, options, 'vue', {
    extraPackages,
  });
};

export default generator;
