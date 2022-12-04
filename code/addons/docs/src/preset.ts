import fs from 'fs-extra';
import remarkSlug from 'remark-slug';
import remarkExternalLinks from 'remark-external-links';
import { dedent } from 'ts-dedent';

import type { IndexerOptions, StoryIndexer, DocsOptions, Options } from '@storybook/types';
import type { CsfPluginOptions } from '@storybook/csf-plugin';
import { loadCsf } from '@storybook/csf-tools';

// for frameworks that are not working with react, we need to configure
// the jsx to transpile mdx, for now there will be a flag for that
// for more complex solutions we can find alone that we need to add '@babel/plugin-transform-react-jsx'
type BabelParams = {
  mdxBabelOptions?: any;
  configureJSX?: boolean;
};
function createBabelOptions({ mdxBabelOptions, configureJSX }: BabelParams) {
  const babelPlugins = mdxBabelOptions?.plugins || [];

  const filteredBabelPlugins = babelPlugins.filter((p: any) => {
    const name = Array.isArray(p) ? p[0] : p;
    if (typeof name === 'string') {
      return !name.includes('plugin-transform-react-jsx');
    }
    return true;
  });

  const jsxPlugin = [
    require.resolve('@babel/plugin-transform-react-jsx'),
    { pragma: 'React.createElement', pragmaFrag: 'React.Fragment' },
  ];
  const plugins = configureJSX ? [...filteredBabelPlugins, jsxPlugin] : babelPlugins;
  return {
    // don't use the root babelrc by default (users can override this in mdxBabelOptions)
    babelrc: false,
    configFile: false,
    ...mdxBabelOptions,
    plugins,
  };
}

async function webpack(
  webpackConfig: any = {},
  options: Options &
    BabelParams & {
      /** @deprecated */
      sourceLoaderOptions: any;
      csfPluginOptions: CsfPluginOptions | null;
      transcludeMarkdown: boolean;
    } /* & Parameters<
      typeof createCompiler
    >[0] */
) {
  const resolvedBabelLoader = await options.presets.apply('babelLoaderRef');

  const { module = {} } = webpackConfig;

  // it will reuse babel options that are already in use in storybook
  // also, these babel options are chained with other presets.
  const {
    mdxBabelOptions,
    configureJSX = true,
    csfPluginOptions = {},
    sourceLoaderOptions = null,
    transcludeMarkdown = false,
  } = options;

  const mdxLoaderOptions = {
    // whether to skip storybook files, useful for docs only mdx or md files
    skipCsf: true,
    remarkPlugins: [remarkSlug, remarkExternalLinks],
  };

  if (sourceLoaderOptions) {
    throw new Error(dedent`
      Addon-docs no longer uses source-loader in 7.0.

      To update your configuration, please see migration instructions here:

      https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#dropped-source-loader--storiesof-static-snippets
    `);
  }

  const mdxLoader = require.resolve('@storybook/mdx2-csf/loader');

  let rules = module.rules || [];
  if (transcludeMarkdown) {
    rules = [
      ...rules.filter((rule: any) => rule.test?.toString() !== '/\\.md$/'),
      {
        test: /\.md$/,
        use: [
          {
            loader: resolvedBabelLoader,
            options: createBabelOptions({ mdxBabelOptions, configureJSX }),
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
    plugins: [
      ...(webpackConfig.plugins || []),
      // eslint-disable-next-line global-require
      ...(csfPluginOptions ? [require('@storybook/csf-plugin').webpack(csfPluginOptions)] : []),
    ],

    module: {
      ...module,
      rules: [
        ...rules,
        {
          test: /(stories|story)\.mdx$/,
          use: [
            {
              loader: resolvedBabelLoader,
              options: createBabelOptions({ mdxBabelOptions, configureJSX }),
            },
            {
              loader: mdxLoader,
              options: {
                ...mdxLoaderOptions,
                skipCsf: false,
              },
            },
          ],
        },
        {
          test: /\.mdx$/,
          exclude: /(stories|story)\.mdx$/,
          use: [
            {
              loader: resolvedBabelLoader,
              options: createBabelOptions({ mdxBabelOptions, configureJSX }),
            },
            {
              loader: mdxLoader,
              options: mdxLoaderOptions,
            },
          ],
        },
      ],
    },
  };

  return result;
}

const storyIndexers = (indexers: StoryIndexer[] | null) => {
  const mdxIndexer = async (fileName: string, opts: IndexerOptions) => {
    let code = (await fs.readFile(fileName, 'utf-8')).toString();
    const { compile } = await import('@storybook/mdx2-csf');
    code = await compile(code, {});
    return loadCsf(code, { ...opts, fileName }).parse();
  };
  return [
    {
      test: /(stories|story)\.mdx$/,
      indexer: mdxIndexer,
    },
    ...(indexers || []),
  ];
};

const docs = (docsOptions: DocsOptions) => {
  return {
    ...docsOptions,
    enabled: true,
    defaultName: 'Docs',
    docsPage: true,
  };
};

/*
 * This is a workaround for https://github.com/Swatinem/rollup-plugin-dts/issues/162
 * something down the dependency chain is using typescript namespaces, which are not supported by rollup-plugin-dts
 */
const webpackX = webpack as any;
const storyIndexersX = storyIndexers as any;
const docsX = docs as any;

export { webpackX as webpack, storyIndexersX as storyIndexers, docsX as docs };
