// @ts-expect-error (TODO)
import { getNameFromFilename } from '@storybook/addon-svelte-csf/dist/cjs/parser/svelte-stories-loader';
import { readFileSync } from 'fs';
// @ts-expect-error (TODO)
import { extractStories } from '@storybook/addon-svelte-csf/dist/cjs/parser/extract-stories';
import type { Options } from '@sveltejs/vite-plugin-svelte';
import * as svelte from 'svelte/compiler';
import MagicString from 'magic-string';
import { createFilter } from 'vite';
import type { PluginOption } from 'vite';

const parser = require
  .resolve('@storybook/addon-svelte-csf/dist/esm/parser/collect-stories')
  .replace(/[/\\]/g, '/');

export default function csfPlugin(svelteOptions?: Options): PluginOption {
  const include = /\.stories\.svelte$/;
  const filter = createFilter(include);

  return {
    name: 'storybook:addon-svelte-csf-plugin',
    enforce: 'post',
    async transform(code: string, id: string) {
      if (!filter(id)) return undefined;

      const s = new MagicString(code);
      const component = getNameFromFilename(id);
      let source = readFileSync(id).toString();
      if (svelteOptions && svelteOptions.preprocess) {
        source = (await svelte.preprocess(source, svelteOptions.preprocess, { filename: id })).code;
      }
      const all = extractStories(source);
      const { stories } = all;
      const storyDef = Object.entries<any>(stories)
        .filter(([, def]) => !def.template)
        .map(([id]) => `export const ${id} = __storiesMetaData.stories[${JSON.stringify(id)}];`)
        .join('\n');

      s.replace('export default', '// export default');

      const namedExportsOrder = Object.entries<any>(stories)
        .filter(([, def]) => !def.template)
        .map(([id]) => id);

      const output = [
        '',
        `import parser from '${parser}';`,
        `const __storiesMetaData = parser(${component}, ${JSON.stringify(all)});`,
        'export default __storiesMetaData.meta;',
        `export const __namedExportsOrder = ${JSON.stringify(namedExportsOrder)};`,
        storyDef,
      ].join('\n');

      s.append(output);

      return {
        code: s.toString(),
        map: s.generateMap({ hires: true, source: id }),
      };
    },
  };
}
