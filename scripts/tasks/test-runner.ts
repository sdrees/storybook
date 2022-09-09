import { servePackages } from '../utils/serve-packages';
import type { Task } from '../task';
import { exec } from '../utils/exec';
import { serveSandbox } from '../utils/serve-sandbox';

export const testRunner: Task = {
  junit: true,
  before: ['publish', 'build'],
  async ready() {
    return false;
  },
  async run(_, { sandboxDir, builtSandboxDir, junitFilename }) {
    const execOptions = { cwd: sandboxDir };

    // We could split this out into a separate task if it became annoying
    const publishController = await servePackages({});
    await exec(`yarn add --dev @storybook/test-runner@0.7.1-next.0`, execOptions);

    const storybookController = await serveSandbox(builtSandboxDir, {});

    await exec(`yarn test-storybook --url http://localhost:8001 --junit`, {
      ...execOptions,
      env: {
        JEST_JUNIT_OUTPUT_FILE: junitFilename,
      },
    });

    publishController.abort();
    storybookController.abort();
  },
};
