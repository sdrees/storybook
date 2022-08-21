import { pathExists } from 'fs-extra';
import { resolve } from 'path';

import { exec } from '../utils/exec';
import type { Task } from '../task';

const verdaccioCacheDir = resolve(__dirname, '../../.verdaccio-cache');

export const publish: Task = {
  before: ['bootstrap'],
  async ready() {
    return pathExists(verdaccioCacheDir);
  },
  async run() {
    return exec(
      'yarn local-registry --publish',
      {},
      {
        startMessage: '📕 Publishing packages',
        errorMessage: '❌ Failed publishing packages',
      }
    );
  },
};
