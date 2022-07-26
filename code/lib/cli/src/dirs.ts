import { dirname } from 'path';

export function getBaseDir() {
  return dirname(require.resolve('@storybook/cli/package.json'));
}
