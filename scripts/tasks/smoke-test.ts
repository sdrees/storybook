import type { Task } from '../task';
import { exec } from '../utils/exec';

export const smokeTest: Task = {
  before: ['create'],
  async ready() {
    return false;
  },
  async run(_, { sandboxDir }) {
    return exec(`yarn storybook --smoke-test --quiet`, { cwd: sandboxDir });
  },
};
