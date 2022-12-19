/* eslint-disable import/export */
export * from '@storybook/addon-docs/dist/preset';

export const mdxLoaderOptions = async (config: any) => {
  // eslint-disable-next-line no-param-reassign
  config.mdxCompileOptions.providerImportSource = '@storybook/addon-essentials/docs/mdx-react-shim';
  return config;
};
