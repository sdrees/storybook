import { exec } from '../utils/exec';
import type { Task } from '../task';

const command = `nx run-many --target="check" --all --parallel --exclude=@storybook/addon-storyshots,@storybook/addon-storyshots-puppeteer`;

export const check: Task = {
  description: 'Compile the source code of the monorepo',
  dependsOn: ['compile'],
  async ready() {
    return false;
  },
  async run({ codeDir }, { dryRun, debug }) {
    return exec(
      command,
      { cwd: codeDir },
      {
        startMessage: '🥾 Checking types validity',
        errorMessage: '❌ Unsound types detected',
        dryRun,
        debug,
      }
    );
  },
};
