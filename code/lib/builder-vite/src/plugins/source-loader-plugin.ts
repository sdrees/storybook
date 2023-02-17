import type { Plugin } from 'vite';
import sourceLoaderTransform from '@storybook/source-loader';
import MagicString from 'magic-string';
import type { Options } from '@storybook/types';

const storyPattern = /\.stories\.[jt]sx?$/;
const storySourcePattern = /var __STORY__ = "(.*)"/;
const storySourceReplacement = '--STORY_SOURCE_REPLACEMENT--';

const mockClassLoader = (id: string) => ({
  // eslint-disable-next-line no-console
  emitWarning: (message: string) => console.warn(message),
  resourcePath: id,
  getOptions: () => ({ injectStoryParameters: true }),
  extension: `.${id.split('.').pop()}`,
});

// HACK: Until we can support only node 15+ and use string.prototype.replaceAll
const replaceAll = (str: string, search: string, replacement: string) => {
  return str.split(search).join(replacement);
};

export function sourceLoaderPlugin(options: Options): Plugin | Plugin[] {
  if (options.configType === 'DEVELOPMENT') {
    return {
      name: 'storybook:source-loader-plugin',
      enforce: 'pre',
      async transform(src: string, id: string) {
        if (id.match(storyPattern)) {
          const code: string = await sourceLoaderTransform.call(mockClassLoader(id), src);
          const s = new MagicString(src);
          // Entirely replace with new code
          s.overwrite(0, src.length, code);

          return {
            code: s.toString(),
            map: s.generateMap({ hires: true, source: id }),
          };
        }
        return undefined;
      },
    };
  }

  // In production, we need to be fancier, to avoid vite:define plugin from replacing values inside the `__STORY__` string
  const storySources = new WeakMap<Options, Map<string, string>>();

  return [
    {
      name: 'storybook-vite-source-loader-plugin',
      enforce: 'pre',
      buildStart() {
        storySources.set(options, new Map());
      },
      async transform(src: string, id: string) {
        if (id.match(storyPattern)) {
          let code: string = await sourceLoaderTransform.call(mockClassLoader(id), src);
          // eslint-disable-next-line @typescript-eslint/naming-convention
          const [_, sourceString] = code.match(storySourcePattern) ?? [null, null];
          if (sourceString) {
            const map = storySources.get(options);
            map?.set(id, sourceString);

            // Remove story source so that it is not processed by vite:define plugin
            code = replaceAll(code, sourceString, storySourceReplacement);
          }

          const s = new MagicString(src);
          // Entirely replace with new code
          s.overwrite(0, src.length, code);

          return {
            code: s.toString(),
            map: s.generateMap(),
          };
        }
        return undefined;
      },
    },
    {
      name: 'storybook-vite-source-loader-plugin-post',
      enforce: 'post',
      buildStart() {
        storySources.set(options, new Map());
      },
      async transform(src: string, id: string) {
        if (id.match(storyPattern)) {
          const s = new MagicString(src);
          const map = storySources.get(options);
          const storySourceStatement = map?.get(id);
          // Put the previously-extracted source back in
          if (storySourceStatement) {
            const newCode = replaceAll(src, storySourceReplacement, storySourceStatement);
            s.overwrite(0, src.length, newCode);
          }

          return {
            code: s.toString(),
            map: s.generateMap(),
          };
        }
        return undefined;
      },
    },
  ];
}
