import type { Task } from '../task';
import { exec } from '../utils/exec';
import { maxConcurrentTasks } from '../utils/maxConcurrentTasks';

const parallel = process.env.CI ? 8 : maxConcurrentTasks;

const command = `nx run-many --target="check" --all --parallel=${parallel} --exclude=@storybook/addon-storyshots,@storybook/addon-storyshots-puppeteer`;

export const check: Task = {
  description: 'Typecheck the source code of the monorepo',
  dependsOn: ['compile'],
  async ready() {
    return false;
  },
  async run({ codeDir }, { dryRun, debug, link }) {
    if (link) throw new Error('Cannot check when linked, please run with `--no-link`');
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
