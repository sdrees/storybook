import { exec } from '../utils/exec';
import type { Task } from '../task';

export const bootstrap: Task = {
  before: [],
  async ready() {
    // It isn't really possible to tell if bootstrapping is required
    return false;
  },
  async run() {
    return exec(
      'yarn bootstrap --core',
      {},
      {
        startMessage: '🥾 Bootstrapping',
        errorMessage: '❌ Failed to bootstrap',
      }
    );
  },
};
