import { join } from 'path';
import { baseGenerator } from '../baseGenerator';
import type { Generator } from '../types';
import { copyTemplate } from '../../helpers';
import { getBaseDir } from '../../dirs';

const generator: Generator = async (packageManager, npmOptions, options) => {
  await baseGenerator(packageManager, npmOptions, options, 'server', {
    extensions: ['json'],
  });

  const templateDir = join(getBaseDir(), 'templates', 'server');
  copyTemplate(templateDir);
};

export default generator;
