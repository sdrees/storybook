import { pathExists } from 'fs-extra';

import type { Task } from '../task';
import { options, sandbox } from '../sandbox';
import { getDefaults } from '../utils/options';

export const create: Task = {
  before: ['publish'],
  async ready(_, { sandboxDir }) {
    return pathExists(sandboxDir);
  },
  async run(templateKey) {
    return sandbox({
      ...getDefaults(options),
      template: templateKey,
      link: false,
      publish: false,
      startVerdaccio: true,
      start: false,
      debug: true,
    });
  },
};
