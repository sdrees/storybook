// eslint-disable-next-line import/no-extraneous-dependencies
import * as parser from '@babel/parser';

export const babelParse = (code: string) =>
  parser.parse(code, {
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
