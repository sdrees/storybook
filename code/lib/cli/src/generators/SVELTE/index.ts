import { CoreBuilder } from '../../project_types';
import { baseGenerator } from '../baseGenerator';
import { Generator } from '../types';

const generator: Generator = async (packageManager, npmOptions, options) => {
  const extraPackages = options.builder === CoreBuilder.Webpack5 ? ['svelte', 'svelte-loader'] : [];

  await baseGenerator(packageManager, npmOptions, options, 'svelte', {
    extraPackages,
    extensions: ['js', 'jsx', 'ts', 'tsx', 'svelte'],
    commonJs: true,
  });
};

export default generator;
