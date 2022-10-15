import { pathExists } from 'fs-extra';
import { join } from 'path';
import type { Task } from '../task';
import { exec } from '../utils/exec';

export const install: Task = {
  description: 'Install the dependencies of the monorepo',
  async ready({ codeDir }) {
    return pathExists(join(codeDir, 'node_modules'));
  },
  async run({ codeDir }, { dryRun, debug }) {
    return exec(`yarn install`, { cwd: codeDir }, { dryRun, debug });
  },
};
