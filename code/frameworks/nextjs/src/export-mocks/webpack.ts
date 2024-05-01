import { dirname, join } from 'path';
import type { Configuration as WebpackConfig } from 'webpack';

export const getPackageAliases = ({ useESM = false }: { useESM?: boolean } = {}) => {
  const extension = useESM ? 'mjs' : 'js';
  const packageLocation = dirname(require.resolve('@storybook/nextjs/package.json'));
  // Use paths for both next/xyz and @storybook/nextjs/xyz imports
  // to make sure they all serve the MJS version of the file
  const headersPath = join(packageLocation, `/dist/export-mocks/headers/index.${extension}`);
  const navigationPath = join(packageLocation, `/dist/export-mocks/navigation/index.${extension}`);
  const cachePath = join(packageLocation, `/dist/export-mocks/cache/index.${extension}`);
  const routerPath = join(packageLocation, `/dist/export-mocks/router/index.${extension}`);

  return {
    'next/headers': headersPath,
    '@storybook/nextjs/headers.mock': headersPath,

    'next/navigation': navigationPath,
    '@storybook/nextjs/navigation.mock': navigationPath,

    'next/router': routerPath,
    '@storybook/nextjs/router.mock': routerPath,

    'next/cache': cachePath,
    '@storybook/nextjs/cache.mock': cachePath,
  };
};

export const configureNextExportMocks = (baseConfig: WebpackConfig): void => {
  const resolve = baseConfig.resolve ?? {};

  resolve.alias = {
    ...resolve.alias,
    ...getPackageAliases({ useESM: true }),
  };
};
