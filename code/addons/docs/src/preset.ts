import fs from 'fs-extra';
import remarkSlug from 'remark-slug';
import remarkExternalLinks from 'remark-external-links';
import { dedent } from 'ts-dedent';

import type { IndexerOptions, StoryIndexer, DocsOptions, Options } from '@storybook/types';
import type { CsfPluginOptions } from '@storybook/csf-plugin';
import type { JSXOptions } from '@storybook/mdx2-csf';
import { loadCsf } from '@storybook/csf-tools';

async function webpack(
  webpackConfig: any = {},
  options: Options & {
    /**
     * @deprecated
     * Use `jsxOptions` to customize options used by @babel/preset-react
     */
    configureJsx: boolean;
    /**
     * @deprecated
     * Use `jsxOptions` to customize options used by @babel/preset-react
     */
    mdxBabelOptions?: any;
    /** @deprecated */
    sourceLoaderOptions: any;
    csfPluginOptions: CsfPluginOptions | null;
    transcludeMarkdown: boolean;
    jsxOptions?: JSXOptions;
  } /* & Parameters<
      typeof createCompiler
    >[0] */
) {
  const { module = {} } = webpackConfig;

  // it will reuse babel options that are already in use in storybook
  // also, these babel options are chained with other presets.
  const {
    csfPluginOptions = {},
    jsxOptions = {},
    transcludeMarkdown = false,
    sourceLoaderOptions = null,
    configureJsx,
    mdxBabelOptions,
  } = options;

  const mdxLoaderOptions = await options.presets.apply('mdxLoaderOptions', {
    skipCsf: true,
    mdxCompileOptions: {
      providerImportSource: '@storybook/addon-docs/mdx-react-shim',
      remarkPlugins: [remarkSlug, remarkExternalLinks],
    },
    jsxOptions,
  });

  if (sourceLoaderOptions) {
    throw new Error(dedent`
      Addon-docs no longer uses source-loader in 7.0.

      To update your configuration, please see migration instructions here:

      https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#dropped-source-loader--storiesof-static-snippets
    `);
  }

  if (mdxBabelOptions || configureJsx) {
    throw new Error(dedent`
      Addon-docs no longer uses configureJsx or mdxBabelOptions in 7.0.

      To update your configuration, please see migration instructions here:

      https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#dropped-addon-docs-manual-babel-configuration
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
