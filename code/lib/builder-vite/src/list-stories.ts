import * as posixPath from 'node:path/posix'; // Glob requires forward-slashes
import { promise as glob } from 'glob-promise';
import { normalizeStories } from '@storybook/core-common';

import type { Options } from '@storybook/types';

export async function listStories(options: Options) {
  return (
    await Promise.all(
      normalizeStories(await options.presets.apply('stories', [], options), {
        configDir: options.configDir,
        workingDir: options.configDir,
      }).map(({ directory, files }) => {
        const pattern = posixPath.join(directory, files);

        return glob(
          posixPath.isAbsolute(pattern) ? pattern : posixPath.join(options.configDir, pattern),
          {
            follow: true,
          }
        );
      })
    )
  ).reduce((carry, stories) => carry.concat(stories), []);
}
