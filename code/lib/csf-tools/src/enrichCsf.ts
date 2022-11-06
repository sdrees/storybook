/* eslint-disable no-underscore-dangle */
import * as t from '@babel/types';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as generate from '@babel/generator';
import type { CsfFile } from './CsfFile';

export interface EnrichCsfOptions {
  disableSource?: boolean;
  disableDescription?: boolean;
}

export const enrichCsf = (csf: CsfFile, options?: EnrichCsfOptions) => {
  Object.keys(csf._storyExports).forEach((key) => {
    const storyExport = csf.getStoryExport(key);
    const source = !options?.disableSource && extractSource(storyExport);
    const description =
      !options?.disableDescription && extractDescription(csf._storyStatements[key]);
    const parameters = [];
    const originalParameters = t.memberExpression(t.identifier(key), t.identifier('parameters'));
    parameters.push(t.spreadElement(originalParameters));

    // storySource: { source: %%source%% },
    if (source) {
      const optionalStorySource = t.optionalMemberExpression(
        originalParameters,
        t.identifier('storySource'),
        false,
        true
      );

      parameters.push(
        t.objectProperty(
          t.identifier('storySource'),
          t.objectExpression([
            t.objectProperty(t.identifier('source'), t.stringLiteral(source)),
            t.spreadElement(optionalStorySource),
          ])
        )
      );
    }

    // docs: { description: { story: %%description%% } },
    if (description) {
      const optionalDocs = t.optionalMemberExpression(
        originalParameters,
        t.identifier('docs'),
        false,
        true
      );

      const optionalDescription = t.optionalMemberExpression(
        optionalDocs,
        t.identifier('description'),
        false,
        true
      );

      parameters.push(
        t.objectProperty(
          t.identifier('docs'),
          t.objectExpression([
            t.spreadElement(optionalDocs),
            t.objectProperty(
              t.identifier('description'),
              t.objectExpression([
                t.objectProperty(t.identifier('story'), t.stringLiteral(description)),
                t.spreadElement(optionalDescription),
              ])
            ),
          ])
        )
      );
    }
    if (parameters.length > 1) {
      const addParameter = t.expressionStatement(
        t.assignmentExpression('=', originalParameters, t.objectExpression(parameters))
      );
      csf._ast.program.body.push(addParameter);
    }
  });
};

export const extractSource = (node: t.Node) => {
  const src = t.isVariableDeclarator(node) ? node.init : node;
  const { code } = generate.default(src, {});
  return code;
};

export const extractDescription = (node?: t.Node) => {
  if (!node?.leadingComments) return '';
  const comments = node.leadingComments
    .map((comment) => {
      if (comment.type === 'CommentLine' || !comment.value.startsWith('*')) return null;
      return (
        comment.value
          .split('\n')
          // remove leading *'s and spaces from the beginning of each line
          .map((line) => line.replace(/^(\s+)?(\*+)?(\s)?/, ''))
          .join('\n')
          .trim()
      );
    })
    .filter(Boolean);
  return comments.join('\n');
};
