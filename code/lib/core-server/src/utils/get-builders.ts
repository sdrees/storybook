import type { Options, CoreConfig, Builder } from '@storybook/types';

export async function getManagerBuilder(): Promise<Builder<unknown>> {
  return import('@storybook/builder-manager');
}

export async function getPreviewBuilder(
  builderName: string,
  configDir: string
): Promise<Builder<unknown>> {
  let builderPackage: string;
  if (builderName) {
    builderPackage = require.resolve(
      ['webpack5'].includes(builderName) ? `@storybook/builder-${builderName}` : builderName,
      { paths: [configDir] }
    );
  } else {
    throw new Error('no builder configured!');
  }
  const previewBuilder = await import(builderPackage);
  return previewBuilder;
}

export async function getBuilders({ presets, configDir }: Options): Promise<Builder<unknown>[]> {
  const core = await presets.apply<CoreConfig>('core', undefined);
  const builderName = typeof core?.builder === 'string' ? core.builder : core?.builder?.name;

  return Promise.all([getPreviewBuilder(builderName, configDir), getManagerBuilder()]);
}
