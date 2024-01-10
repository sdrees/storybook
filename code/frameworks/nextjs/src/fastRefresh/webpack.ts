import type { Configuration as WebpackConfig } from 'webpack';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

export const configureFastRefresh = (baseConfig: WebpackConfig): void => {
  baseConfig.plugins = [
    ...(baseConfig.plugins ?? []),
    new ReactRefreshWebpackPlugin({
      overlay: {
        sockIntegration: 'whm',
      },
    }),
  ];
};
