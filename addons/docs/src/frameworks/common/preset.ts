import path from 'path';
import remarkSlug from 'remark-slug';
import remarkExternalLinks from 'remark-external-links';
import global from 'global';

import type { BuilderConfig, Options } from '@storybook/core-common';

const { log } = console;

// for frameworks that are not working with react, we need to configure
// the jsx to transpile mdx, for now there will be a flag for that
// for more complex solutions we can find alone that we need to add '@babel/plugin-transform-react-jsx'
type BabelParams = {
  babelOptions?: any;
  mdxBabelOptions?: any;
  configureJSX?: boolean;
};
function createBabelOptions({ babelOptions, mdxBabelOptions, configureJSX }: BabelParams) {
  const babelPlugins = mdxBabelOptions?.plugins || babelOptions?.plugins || [];
  const jsxPlugin = [
    require.resolve('@babel/plugin-transform-react-jsx'),
    { pragma: 'React.createElement', pragmaFrag: 'React.Fragment' },
  ];
  const plugins = configureJSX ? [...babelPlugins, jsxPlugin] : babelPlugins;
  return {
    // don't use the root babelrc by default (users can override this in mdxBabelOptions)
    babelrc: false,
    configFile: false,
    ...babelOptions,
    ...mdxBabelOptions,
    plugins,
  };
}

export async function webpack(
  webpackConfig: any = {},
  options: Options &
    BabelParams & { sourceLoaderOptions: any; transcludeMarkdown: boolean } /* & Parameters<
      typeof createCompiler
    >[0] */
) {
  const { builder = 'webpack4' } = await options.presets.apply<{
    builder: BuilderConfig;
  }>('core', {} as any);

  const builderName = typeof builder === 'string' ? builder : builder.name;
  const resolvedBabelLoader = require.resolve('babel-loader', {
    paths: builderName.match(/^webpack(4|5)$/)
      ? [require.resolve(`@storybook/builder-${builderName}`)]
      : [builderName],
  });

  const { module = {} } = webpackConfig;

  // it will reuse babel options that are already in use in storybook
  // also, these babel options are chained with other presets.
  const {
    babelOptions,
    mdxBabelOptions,
    configureJSX = true,
    sourceLoaderOptions = { injectStoryParameters: true },
    transcludeMarkdown = false,
  } = options;

  const mdxLoaderOptions = {
    skipCsf: true,
    remarkPlugins: [remarkSlug, remarkExternalLinks],
  };

  const mdxVersion = global.FEATURES?.previewMdx2 ? 'MDX2' : 'MDX1';
  log(`Addon-docs: using ${mdxVersion}`);

  const mdxLoader = global.FEATURES?.previewMdx2
    ? require.resolve('@storybook/mdx2-csf/loader')
    : require.resolve('@storybook/mdx1-csf/loader');

  // set `sourceLoaderOptions` to `null` to disable for manual configuration
  const sourceLoader = sourceLoaderOptions
    ? [
        {
          test: /\.(stories|story)\.[tj]sx?$/,
          loader: require.resolve('@storybook/source-loader'),
          options: { ...sourceLoaderOptions, inspectLocalDependencies: true },
          enforce: 'pre',
        },
      ]
    : [];

  let rules = module.rules || [];
  if (transcludeMarkdown) {
    rules = [
      ...rules.filter((rule: any) => rule.test?.toString() !== '/\\.md$/'),
      {
        test: /\.md$/,
        use: [
          {
            loader: resolvedBabelLoader,
            options: createBabelOptions({ babelOptions, mdxBabelOptions, configureJSX }),
          },
          {
            loader: mdxLoader,
            options: mdxLoaderOptions,
          },
        ],
      },
    ];
  }

  const result = {
    ...webpackConfig,
    module: {
      ...module,
      rules: [
        ...rules,
        {
          test: /\.js$/,
          include: new RegExp(`node_modules\\${path.sep}acorn-jsx`),
          use: [
            {
              loader: resolvedBabelLoader,
              options: {
                presets: [[require.resolve('@babel/preset-env'), { modules: 'commonjs' }]],
              },
            },
          ],
        },
        {
          test: /(stories|story)\.mdx$/,
          use: [
            {
              loader: resolvedBabelLoader,
              options: createBabelOptions({ babelOptions, mdxBabelOptions, configureJSX }),
            },
            {
              loader: mdxLoader,
            },
          ],
        },
        {
          test: /\.mdx$/,
          exclude: /(stories|story)\.mdx$/,
          use: [
            {
              loader: resolvedBabelLoader,
              options: createBabelOptions({ babelOptions, mdxBabelOptions, configureJSX }),
            },
            {
              loader: mdxLoader,
              options: mdxLoaderOptions,
            },
          ],
        },
        ...sourceLoader,
      ],
    },
  };

  return result;
}
