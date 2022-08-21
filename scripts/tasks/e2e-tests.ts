import type { Task } from '../task';
import { exec } from '../utils/exec';
import { serveSandbox } from '../utils/serve-sandbox';

export const e2eTests: Task = {
  before: ['build'],
  junit: true,
  async ready() {
    return false;
  },
  async run(_, { builtSandboxDir, junitFilename, template }) {
    const storybookController = await serveSandbox(builtSandboxDir, {});

    await exec('yarn playwright test --reporter=junit', {
      env: {
        STORYBOOK_URL: `http://localhost:8001`,
        STORYBOOK_TEMPLATE_NAME: template.name,
        ...(junitFilename && {
          PLAYWRIGHT_JUNIT_OUTPUT_NAME: junitFilename,
        }),
      },
    });

    storybookController.abort();
  },
};
