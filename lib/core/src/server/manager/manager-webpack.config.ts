import path from 'path';
import fse from 'fs-extra';
import { DefinePlugin, Configuration } from 'webpack';
import Dotenv from 'dotenv-webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import PnpWebpackPlugin from 'pnp-webpack-plugin';
import VirtualModulePlugin from 'webpack-virtual-modules';
import TerserWebpackPlugin from 'terser-webpack-plugin';

import themingPaths from '@storybook/theming/paths';
import uiPaths from '@storybook/ui/paths';

import readPackage from 'read-pkg-up';
import { getManagerHeadHtml } from '../utils/template';
import { loadEnv } from '../config/utils';

import { babelLoader } from './babel-loader-manager';
import { resolvePathInStorybookCache } from '../utils/resolve-path-in-sb-cache';
import { es6Transpiler } from '../common/es6Transpiler';
import { ManagerWebpackOptions } from '../types';

export default async ({
  configDir,
  configType,
  docsMode,
  entries,
  refs,
  outputDir,
  cache,
  previewUrl,
  versionCheck,
  releaseNotesData,
  presets,
}: ManagerWebpackOptions): Promise<Configuration> => {
  const { raw, stringified } = loadEnv();
  const logLevel = await presets.apply('logLevel', undefined);
  const headHtmlSnippet = await presets.apply(
    'managerHead',
    getManagerHeadHtml(configDir, process.env)
  );
  const isProd = configType === 'PRODUCTION';
  const refsTemplate = fse.readFileSync(path.join(__dirname, 'virtualModuleRef.template.js'), {
    encoding: 'utf8',
  });
  const {
    packageJson: { version },
  } = await readPackage({ cwd: __dirname });

  // @ts-ignore
  // eslint-disable-next-line import/no-extraneous-dependencies
  const { BundleAnalyzerPlugin } = await import('webpack-bundle-analyzer').catch(() => ({}));

  return {
    name: 'manager',
    mode: isProd ? 'production' : 'development',
    bail: isProd,
    // FIXME: `none` is not a valid option for devtool
    // @ts-ignore
    devtool: 'none',
    entry: entries,
    output: {
      path: outputDir,
      filename: '[name].[chunkhash].bundle.js',
      publicPath: '',
    },
    cache,
    plugins: [
      refs
        ? new VirtualModulePlugin({
            [path.resolve(path.join(configDir, `generated-refs.js`))]: refsTemplate.replace(
              `'{{refs}}'`,
              JSON.stringify(refs)
            ),
          })
        : null,
      new HtmlWebpackPlugin({
        filename: `index.html`,
        // FIXME: `none` isn't a known option
        chunksSortMode: 'none' as any,
        alwaysWriteToDisk: true,
        inject: false,
        templateParameters: (compilation, files, options) => ({
          compilation,
          files,
          options,
          version,
          globals: {
            CONFIG_TYPE: configType,
            LOGLEVEL: logLevel,
            VERSIONCHECK: JSON.stringify(versionCheck),
            RELEASE_NOTES_DATA: JSON.stringify(releaseNotesData),
            DOCS_MODE: docsMode, // global docs mode
            PREVIEW_URL: previewUrl, // global preview URL
          },
          headHtmlSnippet,
        }),
        template: require.resolve(`../templates/index.ejs`),
      }),
      new CaseSensitivePathsPlugin(),
      new Dotenv({ silent: true }),
      // graphql sources check process variable
      new DefinePlugin({
        'process.env': stringified,
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      }),
      isProd &&
        BundleAnalyzerPlugin &&
        new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }),
    ].filter(Boolean),
    module: {
      rules: [
        babelLoader(),
        es6Transpiler(),
        {
          test: /\.css$/,
          use: [
            require.resolve('style-loader'),
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 1,
              },
            },
          ],
        },
        {
          test: /\.(svg|ico|jpg|jpeg|png|apng|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/,
          loader: require.resolve('file-loader'),
          query: {
            name: 'static/media/[name].[hash:8].[ext]',
          },
        },
        {
          test: /\.(mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
          loader: require.resolve('url-loader'),
          query: {
            limit: 10000,
            name: 'static/media/[name].[hash:8].[ext]',
          },
        },
      ],
    },
    resolve: {
      extensions: ['.mjs', '.js', '.jsx', '.json', '.cjs', '.ts', '.tsx'],
      modules: ['node_modules'].concat((raw.NODE_PATH as string[]) || []),
      mainFields: isProd ? undefined : ['browser', 'main'],
      alias: {
        ...themingPaths,
        ...uiPaths,
      },
      plugins: [
        // Transparently resolve packages via PnP when needed; noop otherwise
        PnpWebpackPlugin,
      ],
    },
    resolveLoader: {
      plugins: [PnpWebpackPlugin.moduleLoader(module)],
    },
    recordsPath: resolvePathInStorybookCache('public/records.json'),
    performance: {
      hints: false,
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
      runtimeChunk: true,
      sideEffects: true,
      usedExports: true,
      concatenateModules: true,
      minimizer: isProd
        ? [
            new TerserWebpackPlugin({
              cache: true,
              parallel: true,
              sourceMap: true,
              terserOptions: {
                mangle: false,
                keep_fnames: true,
              },
              // FIXME: `cache` isn't a known attribute
            } as any),
          ]
        : [],
    },
  };
};
