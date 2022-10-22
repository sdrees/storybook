import { TransformOptions } from '@babel/core';

export const configureStyledJsxTransforms = async (baseConfig: TransformOptions) => {
  baseConfig.plugins ||= [];

  if (!baseConfig.plugins.includes('styled-jsx/babel')) {
    baseConfig.plugins.push('styled-jsx/babel');
  }
};
