import { BuilderContext } from '@angular-devkit/architect';
import { AngularBuilderOptions } from '../builders/utils/setup';

export declare function getWebpackConfig(
  baseConfig: any,
  options: { builderOptions: AngularBuilderOptions; builderContext: BuilderContext }
): any;
