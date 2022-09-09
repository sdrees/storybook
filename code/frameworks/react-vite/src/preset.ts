/* eslint-disable global-require */
import path from 'path';
import fs from 'fs';
import type { StorybookConfig, TypescriptOptions } from '@storybook/builder-vite';

export const addons: StorybookConfig['addons'] = ['@storybook/react'];

export const core: StorybookConfig['core'] = {
  builder: '@storybook/builder-vite',
};

export function readPackageJson(): Record<string, any> | false {
  const packageJsonPath = path.resolve('package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }

  const jsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  return JSON.parse(jsonContent);
}

export const viteFinal: StorybookConfig['viteFinal'] = async (config, { presets }) => {
  const { plugins = [] } = config;

  const { reactDocgen, reactDocgenTypescriptOptions } = await presets.apply<any>(
    'typescript',
    {} as TypescriptOptions
  );
  let typescriptPresent;

  try {
    const pkgJson = readPackageJson();
    typescriptPresent =
      pkgJson && (pkgJson.devDependencies?.typescript || pkgJson.dependencies?.typescript);
  } catch (e) {
    typescriptPresent = false;
  }

  if (reactDocgen === 'react-docgen-typescript' && typescriptPresent) {
    plugins.push(
      require('@joshwooding/vite-plugin-react-docgen-typescript')(reactDocgenTypescriptOptions)
    );
  } else if (reactDocgen) {
    const { reactDocgen: docgenPlugin } = await import('./plugins/react-docgen');
    // Needs to run before the react plugin, so add to the front
    plugins.unshift(docgenPlugin());
  }

  return config;
};
