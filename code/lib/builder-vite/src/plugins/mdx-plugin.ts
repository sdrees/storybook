import type { Options, StorybookConfig } from '@storybook/types';
import type { Plugin } from 'vite';
import { createFilter } from 'vite';

const isStorybookMdx = (id: string) => id.endsWith('stories.mdx') || id.endsWith('story.mdx');

/**
 * Storybook uses two different loaders when dealing with MDX:
 *
 * - *stories.mdx and *story.mdx are compiled with the CSF compiler
 * - *.mdx are compiled with the MDX compiler directly
 *
 * @see https://github.com/storybookjs/storybook/blob/next/addons/docs/docs/recipes.md#csf-stories-with-arbitrary-mdx
 */
export async function mdxPlugin(options: Options): Promise<Plugin> {
  const include = /\.mdx$/;
  const filter = createFilter(include);
  const addons = await options.presets.apply<StorybookConfig['addons']>('addons', []);
  const docsOptions =
    // @ts-expect-error - not sure what type to use here
    addons.find((a) => [a, a.name].includes('@storybook/addon-docs'))?.options ?? {};

  return {
    name: 'storybook:mdx-plugin',
    enforce: 'pre',
    async transform(src, id) {
      if (!filter(id)) return undefined;

      const { compile } = await import('@storybook/mdx2-csf');

      const mdxLoaderOptions = await options.presets.apply('mdxLoaderOptions', {
        mdxCompileOptions: {
          providerImportSource: '@storybook/addon-docs/mdx-react-shim',
        },
        jsxOptions: docsOptions.jsxOptions,
      });

      const code = String(
        await compile(src, {
          skipCsf: !isStorybookMdx(id),
          ...mdxLoaderOptions,
        })
      );

      return {
        code,
        map: null, // TODO: update mdx2-csf to return the map
      };
    },
  };
}
