import { baseGenerator } from '../baseGenerator';
import { Generator } from '../types';

const generator: Generator = async (packageManager, npmOptions, options) => {
  await baseGenerator(packageManager, npmOptions, options, 'preact', {
    extraPackages: ['core-js'],
  });
};

export default generator;
