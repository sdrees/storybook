import path from 'path';
import type { StorybookConfig } from '@storybook/types';
import { serverRequire } from './interpret-require';
import { validateConfigurationFiles } from './validate-configuration-files';

export function loadMainConfig({ configDir }: { configDir: string }): StorybookConfig {
  validateConfigurationFiles(configDir);

  return serverRequire(path.resolve(configDir, 'main'));
}
