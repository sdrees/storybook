import path from 'path';
import type { StorybookConfig } from '@storybook/types';
import { serverRequire } from './interpret-require';
import { validateConfigurationFiles } from './validate-configuration-files';

export async function loadMainConfig({
  configDir = '.storybook',
  noCache = false,
}: {
  configDir: string;
  noCache?: boolean;
}): Promise<StorybookConfig> {
  await validateConfigurationFiles(configDir);

  const mainJsPath = path.resolve(configDir, 'main');

  if (noCache && require.cache[require.resolve(mainJsPath)]) {
    delete require.cache[require.resolve(mainJsPath)];
  }

  return serverRequire(mainJsPath);
}
