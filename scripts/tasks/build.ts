import { pathExists } from 'fs-extra';
import type { Task } from '../task';
import { exec } from '../utils/exec';

export const build: Task = {
  before: ['create'],
  async ready(_, { builtSandboxDir }) {
    return pathExists(builtSandboxDir);
  },
  async run(_, { sandboxDir }) {
    return exec(`yarn build-storybook --quiet`, { cwd: sandboxDir });
  },
};
