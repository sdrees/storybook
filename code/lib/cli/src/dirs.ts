import { dirname } from 'path';
import type { SupportedFrameworks, SupportedRenderers } from './project_types';
import { externalFrameworks } from './project_types';

export function getCliDir() {
  return dirname(require.resolve('@storybook/cli/package.json'));
}

export function getRendererDir(renderer: SupportedFrameworks | SupportedRenderers) {
  const externalFramework = externalFrameworks.find((framework) => framework.name === renderer);
  const frameworkPackageName =
    externalFramework?.renderer || externalFramework?.packageName || `@storybook/${renderer}`;
  return dirname(
    require.resolve(`${frameworkPackageName}/package.json`, {
      paths: [process.cwd()],
    })
  );
}
