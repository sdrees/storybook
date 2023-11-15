import type { Configuration as WebpackConfig } from 'webpack';
import semver from 'semver';
import { IgnorePlugin } from 'webpack';
import { getNextjsVersion } from '../utils';

export function configureNextImport(baseConfig: WebpackConfig) {
  const nextJSVersion = getNextjsVersion();

  const isNext12 = semver.satisfies(nextJSVersion, '~12');
  const isNextVersionSmallerThan12dot2 = semver.lt(nextJSVersion, '12.2.0');
  const isNextVersionSmallerThan13 = semver.lt(nextJSVersion, '13.0.0');

  baseConfig.plugins = baseConfig.plugins ?? [];

  if (!isNext12 || isNextVersionSmallerThan12dot2) {
    baseConfig.plugins.push(
      new IgnorePlugin({
        resourceRegExp: /next\/future\/image$/,
      })
    );
  }

  if (isNextVersionSmallerThan13) {
    baseConfig.plugins.push(
      new IgnorePlugin({
        // ignore next/dist/shared/lib/hooks-client-context and next/legacy/image imports
        resourceRegExp:
          /(next\/dist\/shared\/lib\/hooks-client-context|next\/dist\/shared\/lib\/hooks-client-context\.shared-runtime|next\/legacy\/image)$/,
      })
    );
  }

  if (isNextVersionSmallerThan12dot2) {
    baseConfig.plugins.push(
      new IgnorePlugin({
        resourceRegExp: /next\/dist\/shared\/lib\/app-router-context$/,
      })
    );
  }
}
