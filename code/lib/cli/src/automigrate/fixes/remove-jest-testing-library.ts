import chalk from 'chalk';
import dedent from 'ts-dedent';
import type { Fix } from '../types';

export const removeJestTestingLibrary: Fix<{ incompatiblePackages: string[] }> = {
  id: 'remove-jest-testing-library',
  versionRange: ['<8.0.0-alpha.0', '>=8.0.0-alpha.0'],
  promptType: 'manual',
  async check({ packageManager }) {
    const deps = await packageManager.getAllDependencies();

    const incompatiblePackages = Object.keys(deps).filter(
      (it) => it === '@storybook/jest' || it === '@storybook/testing-library'
    );
    return incompatiblePackages.length ? { incompatiblePackages } : null;
  },
  prompt({ incompatiblePackages }) {
    return dedent`
      ${chalk.bold(
        'Attention'
      )}: We've detected that you're using the following packages which are known to be incompatible since Storybook 8:

      ${incompatiblePackages.map((name) => `- ${chalk.cyan(`${name}`)}`).join('\n')}
      
      Install the replacement for those packages: ${chalk.cyan('@storybook/test')}
      
      And run the following codemod:
       ${chalk.cyan(
         'npx storybook migrate migrate-to-test-package --glob="**/*.stories.@(js|jsx|ts|tsx)"'
       )}     
    `;
  },
};
