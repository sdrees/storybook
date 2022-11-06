import { dirname } from 'path';
import type { SupportedFrameworks, SupportedRenderers } from './project_types';

export function getCliDir() {
  return dirname(require.resolve('@storybook/cli/package.json'));
}

export function getRendererDir(renderer: SupportedFrameworks | SupportedRenderers) {
  return dirname(
    require.resolve(`@storybook/${renderer}/package.json`, { paths: [process.cwd()] })
  );
}
