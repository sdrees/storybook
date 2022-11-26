import { pathExists, remove } from 'fs-extra';
import { join, resolve } from 'path';

import type { Task } from '../task';

const logger = console;
const reprosDir = resolve(__dirname, '../../repros');

export const generate: Task = {
  description: 'Create the template repro',
  dependsOn: ['run-registry'],
  async ready({ key }) {
    return pathExists(join(reprosDir, key));
  },
  async run(details) {
    const reproDir = join(reprosDir, details.key);
    if (await this.ready(details)) {
      logger.info('🗑  Removing old repro dir');
      await remove(reproDir);
    }

    // This uses an async import as it depends on `lib/cli` which requires `code` to be installed.
    const { generate: generateRepro } = await import('../next-repro-generators/generate-repros');

    await generateRepro({
      template: details.key,
      localRegistry: true,
    });
  },
};
