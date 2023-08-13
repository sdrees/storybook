import { baseGenerator } from '../baseGenerator';
import type { Generator } from '../types';

const generator: Generator = async (packageManager, npmOptions, options) => {
  await baseGenerator(packageManager, npmOptions, options, 'server', {
    extensions: ['json', 'yaml', 'yml'],
  });
};

export default generator;
