import type { Configuration as WebpackConfig } from 'webpack';
import semver from 'semver';
import { getNextjsVersion, addScopedAlias } from '../utils';

const mapping: Record<string, Record<string, string>> = {
  '<14.0.0': {
    'next/dist/shared/lib/segment': '@storybook/nextjs/dist/compatibility/segment.compat',
    'next/dist/client/components/redirect-status-code':
      '@storybook/nextjs/dist/compatibility/redirect-status-code.compat',
  },
};

export const getCompatibilityAliases = () => {
  const version = getNextjsVersion();
  const result: Record<string, string> = {};

  Object.keys(mapping).filter((key) => {
    if (semver.intersects(version, key)) {
      Object.assign(result, mapping[key]);
    }
  });

  return result;
};

export const configureCompatibilityAliases = (baseConfig: WebpackConfig): void => {
  const aliases = getCompatibilityAliases();

  Object.entries(aliases).forEach(([name, alias]) => {
    addScopedAlias(baseConfig, name, alias);
  });
};
