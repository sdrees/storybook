import * as parser from '@babel/parser';
import * as recast from 'recast';

export const babelParse = (code: string) => {
  return recast.parse(code, {
    parser: {
      parse(source: string) {
        return parser.parse(source, {
          sourceType: 'module',
          // FIXME: we should get this from the project config somehow?
          plugins: [
            'jsx',
            'typescript',
            ['decorators', { decoratorsBeforeExport: true }],
            'classProperties',
          ],
          tokens: true,
        });
      },
    },
  });
};
