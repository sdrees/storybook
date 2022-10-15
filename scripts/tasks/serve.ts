import { AbortController } from 'node-abort-controller';
import detectFreePort from 'detect-port';

import type { Task } from '../task';
import { exec } from '../utils/exec';

export const PORT = 8001;
export const serve: Task = {
  description: 'Serve the build storybook for a sandbox',
  service: true,
  dependsOn: ['build'],
  async ready() {
    return (await detectFreePort(PORT)) !== PORT;
  },
  async run({ builtSandboxDir, codeDir }, { debug, dryRun }) {
    const controller = new AbortController();
    exec(
      `yarn http-server ${builtSandboxDir} --port ${PORT}`,
      { cwd: codeDir },
      { dryRun, debug, signal: controller.signal as AbortSignal }
    ).catch((err) => {
      // If aborted, we want to make sure the rejection is handled.
      if (!err.killed) throw err;
    });
    await exec('yarn wait-on http://localhost:8001', { cwd: codeDir }, { dryRun, debug });

    return controller;
  },
};
