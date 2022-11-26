import { pathExists, remove } from 'fs-extra';

import type { Task } from '../task';

const logger = console;

export const sandbox: Task = {
  description: 'Create the sandbox from a template',
  dependsOn: ({ template }, { link }) => {
    if ('inDevelopment' in template && template.inDevelopment) {
      if (link) throw new Error('Cannot link an in development template');

      return ['run-registry', 'generate'];
    }

    if (link) return ['compile'];
    return ['run-registry'];
  },
  async ready({ sandboxDir }) {
    return pathExists(sandboxDir);
  },
  async run(details, options) {
    if (await this.ready(details)) {
      logger.info('🗑  Removing old sandbox dir');
      await remove(details.sandboxDir);
    }
    const { create, install, addStories } = await import('./sandbox-parts');
    await create(details, options);
    await install(details, options);
    if (!options.skipTemplateStories) {
      await addStories(details, options);
    }
  },
};
