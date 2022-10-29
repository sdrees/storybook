import { CoreBuilder } from '../../project_types';
import { baseGenerator } from '../baseGenerator';
import type { Generator } from '../types';

const generator: Generator = async (packageManager, npmOptions, options) => {
  const extraPackages =
    options.builder === CoreBuilder.Webpack5
      ? ['vue-loader@^17.0.0', '@vue/compiler-sfc@^3.2.0']
      : [];
  await baseGenerator(packageManager, npmOptions, options, 'vue3', {
    extraPackages,
  });
};

export default generator;
