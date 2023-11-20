import { getProjectRoot } from '@storybook/core-common';
import { getVirtualModuleMapping } from '@storybook/core-webpack';
import type { Options } from '@storybook/types';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import type { NextConfig } from 'next';
import path from 'path';
import type { RuleSetRule } from 'webpack';
import semver from 'semver';
import { NextjsSWCNotSupportedError } from '@storybook/core-events/server-errors';
import { getNextjsVersion } from '../utils';

export const configureSWCLoader = async (
  baseConfig: any,
  options: Options,
  nextConfig: NextConfig
) => {
  const isDevelopment = options.configType !== 'PRODUCTION';
  const version = getNextjsVersion();

  if (semver.lt(version, '14.0.0')) {
    throw new NextjsSWCNotSupportedError();
  }

  const dir = getProjectRoot();

  baseConfig.plugins = [
    ...baseConfig.plugins,
    new ReactRefreshWebpackPlugin({
      overlay: {
        sockIntegration: 'whm',
      },
    }),
  ];

  const virtualModules = await getVirtualModuleMapping(options);

  baseConfig.module.rules = [
    // TODO: Remove filtering in Storybook 8.0
    ...baseConfig.module.rules.filter((r: RuleSetRule) => {
      return !r.loader?.includes('swc-loader');
    }),
    {
      test: /\.(m?(j|t)sx?)$/,
      include: [getProjectRoot()],
      exclude: [/(node_modules)/, ...Object.keys(virtualModules)],
      enforce: 'post',
      use: {
        // we use our own patch because we need to remove tracing from the original code
        // which is not possible otherwise
        loader: require.resolve('./swc/next-swc-loader-patch.js'),
        options: {
          isServer: false,
          rootDir: dir,
          pagesDir: `${dir}/pages`,
          appDir: `${dir}/apps`,
          hasReactRefresh: isDevelopment,
          nextConfig,
          supportedBrowsers: require('next/dist/build/utils').getSupportedBrowsers(
            dir,
            isDevelopment
          ),
          swcCacheDir: path.join(dir, nextConfig?.distDir ?? '.next', 'cache', 'swc'),
          bundleTarget: 'default',
        },
      },
    },
  ];
};
