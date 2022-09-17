import type { Task } from '../task';
import { exec } from '../utils/exec';

export const smokeTest: Task = {
  before: ['create'],
  async ready() {
    return false;
  },
  async run(_, { sandboxDir }) {
    // eslint-disable-next-line no-console
    console.log(`smoke testing in ${sandboxDir}`);

    return exec(`yarn storybook --smoke-test`, { cwd: sandboxDir }, { debug: true });
  },
};
