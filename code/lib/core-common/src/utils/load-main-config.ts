import path from 'path';
import type { StorybookConfig } from '@storybook/types';
import { serverRequire } from './interpret-require';
import { validateConfigurationFiles } from './validate-configuration-files';

export async function loadMainConfig({
  configDir = '.storybook',
}: {
  configDir: string;
}): Promise<StorybookConfig> {
  await validateConfigurationFiles(configDir);

  return serverRequire(path.resolve(configDir, 'main'));
}
