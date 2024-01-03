import type { Options } from '@storybook/types';
import type { Plugin } from 'vite';
import remarkSlug from 'remark-slug';
import remarkExternalLinks from 'remark-external-links';
import { createFilter } from '@rollup/pluginutils';
import { dirname, join } from 'path';

import { compile } from '../compiler';

/**
 * Storybook uses a single loader when dealing with MDX:
 *
 * - *.mdx are compiled with the MDX compiler directly
 *
 * @see https://github.com/storybookjs/storybook/blob/next/addons/docs/docs/recipes.md#csf-stories-with-arbitrary-mdx
 */
export async function mdxPlugin(options: Options): Promise<Plugin> {
  const include = /\.mdx$/;
  const filter = createFilter(include);
  const { presets } = options;
  const { mdxPluginOptions } = await presets.apply<Record<string, any>>('options', {});

  return {
    name: 'storybook:mdx-plugin',
    enforce: 'pre',
    async transform(src, id) {
      if (!filter(id)) return undefined;

      const mdxLoaderOptions = await options.presets.apply('mdxLoaderOptions', {
        ...mdxPluginOptions,
        mdxCompileOptions: {
          providerImportSource: join(
            dirname(require.resolve('@storybook/addon-docs/package.json')),
            '/dist/shims/mdx-react-shim'
          ),
          ...mdxPluginOptions?.mdxCompileOptions,
          remarkPlugins: [remarkSlug, remarkExternalLinks].concat(
            mdxPluginOptions?.mdxCompileOptions?.remarkPlugins ?? []
          ),
        },
      });

      const code = String(
        await compile(src, {
          ...mdxLoaderOptions,
        })
      );

      return {
        code,
        // TODO: support source maps
        map: null,
      };
    },
  };
}
