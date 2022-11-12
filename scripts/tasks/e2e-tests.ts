import type { Task } from '../task';
import { exec } from '../utils/exec';
import { PORT } from './serve';

export const e2eTests: Task = {
  description: 'Run the end-to-end test suite against the sandbox',
  dependsOn: ['serve'],
  junit: true,
  async ready() {
    return false;
  },
  async run({ codeDir, junitFilename, template }, { dryRun, debug }) {
    await exec(
      `yarn playwright test`,
      {
        env: {
          STORYBOOK_URL: `http://localhost:${PORT}`,
          STORYBOOK_TEMPLATE_NAME: template.name,
          ...(junitFilename && {
            PLAYWRIGHT_JUNIT_OUTPUT_NAME: junitFilename,
          }),
        },
        cwd: codeDir,
      },
      { dryRun, debug }
    );
  },
};
