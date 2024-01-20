import path from 'path';
import type { Options } from '@storybook/types';

interface PropertyObject {
  name: string;
  options?: Record<string, any>;
}

type Property = string | PropertyObject | undefined;

export const pluckNameFromConfigProperty = (property: Property) => {
  if (!property) {
    return undefined;
  }

  return typeof property === 'string' ? property : property.name;
};

// For replacing Windows backslashes with forward slashes
const normalizePath = (packagePath: string) => packagePath.replaceAll(path.sep, '/');

export const pluckStorybookPackageFromPath = (packagePath: string) =>
  normalizePath(packagePath).match(/(@storybook\/.*)$/)?.[1];

export const pluckThirdPartyPackageFromPath = (packagePath: string) =>
  normalizePath(packagePath).split('node_modules/')[1] ?? packagePath;

export const buildFrameworkGlobalsFromOptions = async (options: Options) => {
  const globals: Record<string, any> = {};

  const { renderer, builder } = await options.presets.apply('core');

  const rendererName = pluckNameFromConfigProperty(renderer);
  if (rendererName) {
    globals.STORYBOOK_RENDERER =
      pluckStorybookPackageFromPath(rendererName) ?? pluckThirdPartyPackageFromPath(rendererName);
  }

  const builderName = pluckNameFromConfigProperty(builder);
  if (builderName) {
    globals.STORYBOOK_BUILDER =
      pluckStorybookPackageFromPath(builderName) ?? pluckThirdPartyPackageFromPath(builderName);
  }

  const framework = pluckNameFromConfigProperty(await options.presets.apply('framework'));
  if (framework) {
    globals.STORYBOOK_FRAMEWORK = framework;
  }

  return globals;
};
