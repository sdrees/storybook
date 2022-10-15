import type { Task } from '../task';
import { exec } from '../utils/exec';
import { PORT } from './serve';

export const testRunner: Task = {
  description: 'Run the test runner against a sandbox',
  junit: true,
  dependsOn: ['run-registry', 'serve'],
  async ready() {
    return false;
  },
  async run({ sandboxDir, junitFilename }, { dryRun, debug }) {
    const execOptions = { cwd: sandboxDir };

    // Using a fixed version to work around core-js problems
    await exec(`yarn add --dev @storybook/test-runner@0.8.1--canary.202.99d82aa.0`, execOptions);

    await exec(`yarn why core-js`, {}, { debug: true });

    await exec(
      `yarn test-storybook --url http://localhost:${PORT} --junit --index-json --maxWorkers=2`,
      {
        ...execOptions,
        env: {
          JEST_JUNIT_OUTPUT_FILE: junitFilename,
        },
      },
      { dryRun, debug }
    );
  },
};
