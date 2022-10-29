import type { Configuration as WebpackConfig } from 'webpack';
import semver from 'semver';
import { addScopedAlias, getNextjsVersion } from '../utils';

export const configureRouting = (baseConfig: WebpackConfig): void => {
  // here we resolve the router context path with the installed version of Next.js
  const routerContextPath = getRouterContextPath();
  addScopedAlias(baseConfig, routerContextPath);
};

const getRouterContextPath = () => {
  const version = getNextjsVersion();
  if (semver.gte(version, '11.1.0')) {
    return 'next/dist/shared/lib/router-context';
  }

  return 'next/dist/next-server/lib/router-context';
};
