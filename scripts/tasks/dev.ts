import { AbortController } from 'node-abort-controller';
import detectFreePort from 'detect-port';

import type { Task } from '../task';
import { exec } from '../utils/exec';

export const START_PORT = 6006;

export const dev: Task = {
  description: 'Run the sandbox in development mode',
  service: true,
  dependsOn: ['sandbox'],
  async ready() {
    return (await detectFreePort(START_PORT)) !== START_PORT;
  },
  async run({ sandboxDir, codeDir }, { dryRun, debug }) {
    const controller = new AbortController();
    exec(
      `yarn storybook`,
      { cwd: sandboxDir },
      { dryRun, debug, signal: controller.signal as AbortSignal }
    ).catch((err) => {
      // If aborted, we want to make sure the rejection is handled.
      if (!err.killed) throw err;
    });
    await exec(`yarn wait-on http://localhost:${START_PORT}`, { cwd: codeDir }, { dryRun, debug });

    return controller;
  },
};
