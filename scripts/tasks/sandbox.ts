import { pathExists, remove } from 'fs-extra';

import type { Task } from '../task';

const logger = console;

export const sandbox: Task = {
  description: 'Create the sandbox from a template',
  dependsOn: ({ template }, { link }) => {
    if ('inDevelopment' in template && template.inDevelopment) {
      return ['run-registry', 'generate'];
    }

    if (link) return ['compile'];
    return ['run-registry'];
  },
  async ready({ sandboxDir }) {
    return pathExists(sandboxDir);
  },
  async run(details, options) {
    if (options.link && details.template.inDevelopment) {
      logger.log(
        `The ${options.template} has inDevelopment property enabled, therefore the sandbox for that template cannot be linked. Enabling --no-link mode..`
      );
      // eslint-disable-next-line no-param-reassign
      options.link = false;
    }
    if (await this.ready(details)) {
      logger.info('🗑  Removing old sandbox dir');
      await remove(details.sandboxDir);
    }
    const { create, install, addStories, extendMain } = await import('./sandbox-parts');
    await create(details, options);
    await install(details, options);
    if (!options.skipTemplateStories) {
      await addStories(details, options);
    }
    await extendMain(details, options);
    logger.info(`✅ Storybook sandbox created at ${details.sandboxDir}`);
  },
};
