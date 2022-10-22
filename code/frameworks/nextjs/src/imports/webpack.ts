import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { loadConfig } from 'tsconfig-paths';
import { Configuration as WebpackConfig } from 'webpack';

export const configureImports = (baseConfig: WebpackConfig): void => {
  const configLoadResult = loadConfig();

  if (configLoadResult.resultType === 'failed' || !configLoadResult.baseUrl) {
    // either not a typescript project or tsconfig contains no baseUrl
    return;
  }

  baseConfig.resolve ??= {};
  baseConfig.resolve.plugins ??= [];

  baseConfig.resolve.plugins.push(
    new TsconfigPathsPlugin({
      configFile: configLoadResult.configFileAbsolutePath,
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }) as any
  );
};
