import webpack from 'webpack';
import { logger } from '@storybook/node-logger';
import { AngularLegacyBuildOptionsError } from '@storybook/core-events/server-errors';

import { getWebpackConfig as getCustomWebpackConfig } from './angular-cli-webpack';
import { moduleIsAvailable } from './utils/module-is-available';
import { PresetOptions } from './preset-options';

export async function webpackFinal(baseConfig: webpack.Configuration, options: PresetOptions) {
  if (!moduleIsAvailable('@angular-devkit/build-angular')) {
    logger.info('=> Using base config because "@angular-devkit/build-angular" is not installed');
    return baseConfig;
  }

  checkForLegacyBuildOptions(options);

  return getCustomWebpackConfig(baseConfig, {
    builderOptions: {
      watch: options.configType === 'DEVELOPMENT',
      ...options.angularBuilderOptions,
    },
    builderContext: options.angularBuilderContext,
  });
}

/**
 * Checks if using legacy configuration that doesn't use builder and logs message referring to migration docs.
 */
function checkForLegacyBuildOptions(options: PresetOptions) {
  if (options.angularBrowserTarget !== undefined) {
    // Not use legacy way with builder (`angularBrowserTarget` is defined or null with builder and undefined without)
    return;
  }

  throw new AngularLegacyBuildOptionsError();
}
