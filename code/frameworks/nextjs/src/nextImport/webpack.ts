import type { Configuration as WebpackConfig } from 'webpack';
import semver from 'semver';
import { IgnorePlugin } from 'webpack';
import { getNextjsVersion } from '../utils';

export function configureNextImport(baseConfig: WebpackConfig) {
  const nextJSVersion = getNextjsVersion();

  const isNext12 = semver.satisfies(nextJSVersion, '~12');
  const isNext13 = semver.satisfies(nextJSVersion, '~13');

  baseConfig.plugins = baseConfig.plugins ?? [];

  if (!isNext13) {
    baseConfig.plugins.push(
      new IgnorePlugin({
        resourceRegExp: /next\/legacy\/image$/,
      })
    );
  }

  if (!isNext12) {
    baseConfig.plugins.push(
      new IgnorePlugin({
        resourceRegExp: /next\/future\/image$/,
      })
    );
  }
}
