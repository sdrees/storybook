import type { Task } from '../task';
import { exec } from '../utils/exec';

export const chromatic: Task = {
  before: ['build'],
  junit: true,
  async ready() {
    return false;
  },
  async run(templateKey, { sandboxDir, builtSandboxDir, junitFilename }) {
    const tokenEnvVarName = `CHROMATIC_TOKEN_${templateKey.toUpperCase().replace(/\/|-|\./g, '_')}`;
    const token = process.env[tokenEnvVarName];

    await exec(
      `npx chromatic \
          --exit-zero-on-changes \
          --storybook-build-dir=${builtSandboxDir} \
          --junit-report=${junitFilename} \
          --projectToken=${token}`,
      { cwd: sandboxDir },
      { debug: true }
    );
  },
};
