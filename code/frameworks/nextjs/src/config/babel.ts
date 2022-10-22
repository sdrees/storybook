import { TransformOptions } from '@babel/core';
import { loadConfig } from 'tsconfig-paths';

export const configureTypescript = async (baseConfig: TransformOptions) => {
  const configLoadResult = loadConfig();

  // if tsconfig is successfully loaded, this is a typescript project
  if (configLoadResult.resultType === 'success') {
    baseConfig.presets ||= [];

    if (!baseConfig.presets.includes('@babel/preset-typescript')) {
      baseConfig.presets.push('@babel/preset-typescript');
    }
  }
};
