import type { Fix } from '../types';
import * as fs from 'node:fs/promises';
import * as babel from '@babel/core';
import type { BabelFile, NodePath } from '@babel/core';
import { babelParse } from '@storybook/csf-tools';
import dedent from 'ts-dedent';
import chalk from 'chalk';

export const removeArgtypesRegex: Fix<{ argTypesRegex: NodePath; previewConfigPath: string }> = {
  id: 'remove-argtypes-regex',
  promptType: 'manual',
  versionRange: ['<8.0.0-alpha.0', '>=8.0.0-alpha.0'],
  async check({ previewConfigPath }) {
    if (!previewConfigPath) return null;

    const previewFile = await fs.readFile(previewConfigPath, { encoding: 'utf-8' });

    // @ts-expect-error File is not yet exposed, see https://github.com/babel/babel/issues/11350#issuecomment-644118606
    const file: BabelFile = new babel.File(
      { filename: previewConfigPath },
      { code: previewFile, ast: babelParse(previewFile) }
    );

    let argTypesRegex;

    file.path.traverse({
      Identifier: (path) => {
        if (path.node.name === 'argTypesRegex') {
          argTypesRegex = path;
        }
      },
    });

    return argTypesRegex ? { argTypesRegex, previewConfigPath } : null;
  },
  prompt({ argTypesRegex, previewConfigPath }) {
    return dedent`
      ${chalk.bold('Attention')}: We've detected that you're using argTypesRegex:
      
      ${argTypesRegex.buildCodeFrameError(`${previewConfigPath}`).message}

      In Storybook you can write so-called play functions, which are used to render your stories interactively.
      Mocking action args in play functions was done implicitly by analyzing the argTypesRegex.

      Since Storybook 8, implicit action args mocking isn't supported anymore.
      
      Use the following command to check for mocked action usages in your play functions:
      ${chalk.cyan(
        'npx storybook migrate find-implicit-spies --glob="**/*.stories.@(js|jsx|ts|tsx)"'
      )}
       
      And follow the documentation to migrate your play functions:
      ${chalk.yellow(
        'https://storybook.js.org/docs/8.0/essentials/actions#via-storybooktest-fn-spy-function'
      )}
    `;
  },
};
