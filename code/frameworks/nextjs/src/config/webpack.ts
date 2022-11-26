import type { Configuration as WebpackConfig } from 'webpack';
import semver from 'semver';

import type { NextConfig } from 'next';
import { DefinePlugin } from 'webpack';
import { addScopedAlias, getNextjsVersion, resolveNextConfig } from '../utils';

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

const version = getNextjsVersion();

const setupRuntimeConfig = (baseConfig: WebpackConfig, nextConfig: NextConfig): void => {
  const definePluginConfig: Record<string, any> = {
    // this mimics what nextjs does client side
    // https://github.com/vercel/next.js/blob/57702cb2a9a9dba4b552e0007c16449cf36cfb44/packages/next/client/index.tsx#L101
    'process.env.__NEXT_RUNTIME_CONFIG': JSON.stringify({
      serverRuntimeConfig: {},
      publicRuntimeConfig: nextConfig.publicRuntimeConfig,
    }),
  };

  /**
   * In Next12.2, the `newNextLinkBehavior` option was introduced, defaulted to
   * falsy in the Next app (`undefined` in the config itself), and `next/link`
   * was engineered to opt *in* to it
   *
   * In Next13, the `newNextLinkBehavior` option now defaults to truthy (still
   * `undefined` in the config), and `next/link` was engineered to opt *out*
   * of it
   */
  const newNextLinkBehavior = nextConfig.experimental?.newNextLinkBehavior;
  if (
    (semver.gte(version, '13.0.0') && newNextLinkBehavior !== false) ||
    (semver.gte(version, '12.2.0') && newNextLinkBehavior)
  ) {
    definePluginConfig['process.env.__NEXT_NEW_LINK_BEHAVIOR'] = true;
  }

  baseConfig.plugins?.push(new DefinePlugin(definePluginConfig));
};
