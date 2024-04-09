import { parse as parseCjs, init as initCjsParser } from 'cjs-module-lexer';
import { parse as parseEs } from 'es-module-lexer';
import assert from 'node:assert';

import type { Parser } from './types';

/**
 * A generic parser that can parse both ES and CJS modules.
 */
export class GenericParser implements Parser {
  /**
   * Parse the content of a file and return the exports
   * @param content The content of the file
   * @returns The exports of the file
   */
  async parse(content: string) {
    try {
      // Do NOT remove await here. The types are wrong! It has to be awaited,
      // otherwise it will return a Promise<Promise<...>> when wasm isn't loaded.
      const [, exports] = await parseEs(content);

      assert(
        exports.length > 0,
        'No named exports found. Very likely that this is not a ES module.'
      );

      return {
        exports: (exports ?? []).map((e) => {
          const name = content.substring(e.s, e.e);
          return {
            name,
            default: name === 'default',
          };
        }),
      };
      // Try to parse as CJS module
    } catch {
      await initCjsParser();

      const { exports, reexports } = parseCjs(content);
      const filteredExports = [...exports, ...reexports].filter((e: string) => e !== '__esModule');

      assert(filteredExports.length > 0, 'No named exports found');

      return {
        exports: (filteredExports ?? []).map((name) => ({
          name,
          default: name === 'default',
        })),
      };
    }
  }
}
