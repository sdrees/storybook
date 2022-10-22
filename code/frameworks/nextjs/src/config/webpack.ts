import type { Configuration as WebpackConfig } from 'webpack';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';
import findUp from 'find-up';
import { pathExists } from 'fs-extra';
import { NextConfig } from 'next';
import dedent from 'ts-dedent';
import { DefinePlugin } from 'webpack';
import { addScopedAlias } from '../utils';

export const configureConfig = async ({
  baseConfig,
  nextConfigPath,
  configDir,
}: {
  baseConfig: WebpackConfig;
  nextConfigPath?: string;
  configDir: string;
}): Promise<NextConfig> => {
  const nextConfig = await resolveNextConfig({ baseConfig, nextConfigPath, configDir });

  addScopedAlias(baseConfig, 'next/config');
  setupRuntimeConfig(baseConfig, nextConfig);

  return nextConfig;
};

const findNextConfigFile = async (configDir: string) => {
  const supportedExtensions = ['mjs', 'js'];
  return supportedExtensions.reduce<Promise<undefined | string>>(
    async (acc, ext: string | undefined) => {
      const resolved = await acc;
      if (!resolved) {
        acc = findUp(`next.config.${ext}`, { cwd: configDir });
      }

      return acc;
    },
    Promise.resolve(undefined)
  );
};

const resolveNextConfig = async ({
  baseConfig,
  nextConfigPath,
  configDir,
}: {
  baseConfig: WebpackConfig;
  nextConfigPath?: string;
  configDir: string;
}): Promise<NextConfig> => {
  const nextConfigFile = nextConfigPath || (await findNextConfigFile(configDir));

  if (!nextConfigFile || (await pathExists(nextConfigFile)) === false) {
    throw new Error(
      dedent`
        Could not find or resolve your Next config file. Please provide the next config file path as a framework option.

        More info: https://github.com/storybookjs/storybook/blob/next/code/frameworks/nextjs/README.md#options
      `
    );
  }

  const nextConfigExport = await import(nextConfigFile);

  const nextConfig =
    typeof nextConfigExport === 'function'
      ? nextConfigExport(PHASE_DEVELOPMENT_SERVER, {
          defaultConfig: baseConfig,
        })
      : nextConfigExport;

  return nextConfig;
};

const setupRuntimeConfig = (baseConfig: WebpackConfig, nextConfig: NextConfig): void => {
  baseConfig.plugins?.push(
    new DefinePlugin({
      // this mimics what nextjs does client side
      // https://github.com/vercel/next.js/blob/57702cb2a9a9dba4b552e0007c16449cf36cfb44/packages/next/client/index.tsx#L101
      'process.env.__NEXT_RUNTIME_CONFIG': JSON.stringify({
        serverRuntimeConfig: {},
        publicRuntimeConfig: nextConfig.publicRuntimeConfig,
      }),
    })
  );
};
