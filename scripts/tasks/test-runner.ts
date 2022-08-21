import { join } from 'path';
import { pathExistsSync, readFile, writeFile } from 'fs-extra';

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
    await exec(`yarn add --dev @storybook/test-runner jest-junit`, execOptions);

    // Note we could split this out into a separate task too. We sort of do by checking if the file exists
    const testFilePathname = join(sandboxDir, 'test-runner-jest.config.js');
    if (junitFilename && !(await pathExistsSync(testFilePathname))) {
      await exec(`yarn test-storybook --eject`, execOptions);
      const testFile = await readFile(testFilePathname, 'utf8');

      const reporters = `reporters: [
            'default',
            ['jest-junit', {
              outputDirectory: '${junitFilename}',
              addFileAttribute: 'true',
              usePathForSuiteName: 'true',
              uniqueOutputName: 'true' },
            ],
          ],`;

      const newTestFile = testFile.replace(/}\s*$/m, `${reporters}$&`);
      await writeFile(testFilePathname, newTestFile);
    }

    const storybookController = await serveSandbox(builtSandboxDir, {});

    await exec(`yarn test-storybook --url http://localhost:8001`, execOptions);

    publishController.abort();
    storybookController.abort();
  },
};
