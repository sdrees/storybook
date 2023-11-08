import { parse } from 'es-module-lexer';
import MagicString from 'magic-string';
import type { LoaderContext } from 'webpack';

export default async function loader(this: LoaderContext<any>, source: string) {
  const callback = this.async();

  try {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const [_, exports] = parse(source);

    if (exports.includes('__namedExportsOrder')) {
      return callback(null, source);
    }

    const magicString = new MagicString(source);
    const orderedExports = exports.filter((e) => e !== 'default');
    magicString.append(`;export const __namedExportsOrder = ${JSON.stringify(orderedExports)};`);

    const map = magicString.generateMap({ hires: true });
    return callback(null, magicString.toString(), map);
  } catch (err) {
    return callback(err as any);
  }
}
