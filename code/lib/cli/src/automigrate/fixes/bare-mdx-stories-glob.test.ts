/* eslint-disable no-underscore-dangle */
/// <reference types="@types/jest" />;

import type { StorybookConfig } from '@storybook/types';
import path from 'path';
import type { JsPackageManager, PackageJson } from '../../js-package-manager';
import { ansiRegex } from '../helpers/cleanLog';
import type { BareMdxStoriesGlobRunOptions } from './bare-mdx-stories-glob';
import { bareMdxStoriesGlob } from './bare-mdx-stories-glob';

// eslint-disable-next-line global-require, jest/no-mocks-import
jest.mock('fs-extra', () => require('../../../../../__mocks__/fs-extra'));

const checkBareMdxStoriesGlob = async ({
  packageJson,
  main,
}: {
  packageJson: PackageJson;
  main?: Partial<StorybookConfig>;
}) => {
  if (main) {
    // eslint-disable-next-line global-require
    require('fs-extra').__setMockFiles({
      [path.join('.storybook', 'main.js')]: `module.exports = ${JSON.stringify(main)};`,
    });
  } else {
    // eslint-disable-next-line global-require
    require('fs-extra').__setMockFiles({});
  }
  const packageManager = {
    retrievePackageJson: () => ({ dependencies: {}, devDependencies: {}, ...packageJson }),
  } as JsPackageManager;

  return bareMdxStoriesGlob.check({ packageManager });
};

describe('bare-mdx fix', () => {
  describe('should no-op', () => {
    it('in SB < v7.0.0', async () => {
      const packageJson = {
        dependencies: { '@storybook/react': '^6.2.0' },
      };
      const main = { stories: ['../**/*.stories.mdx'] };
      await expect(checkBareMdxStoriesGlob({ packageJson, main })).resolves.toBeFalsy();
    });

    describe('in SB >= v7.0.0', () => {
      it('without main', async () => {
        const packageJson = {
          dependencies: { '@storybook/react': '^7.0.0' },
        };
        await expect(checkBareMdxStoriesGlob({ packageJson })).rejects.toThrow();
      });

      it('without stories field in main', async () => {
        const packageJson = {
          dependencies: { '@storybook/react': '^7.0.0' },
        };
        const main = {};
        await expect(checkBareMdxStoriesGlob({ packageJson, main })).rejects.toThrow();
      });

      it('with variable references in stories field', async () => {
        // eslint-disable-next-line global-require
        require('fs-extra').__setMockFiles({
          [path.join('.storybook', 'main.js')]: `
          const globVar = '../**/*.stories.mdx';
          module.exports = { stories: [globVar] };`,
        });

        const packageManager = {
          retrievePackageJson: () => ({
            dependencies: { '@storybook/react': '^7.0.0' },
            devDependencies: {},
          }),
        } as unknown as JsPackageManager;

        await expect(bareMdxStoriesGlob.check({ packageManager })).rejects.toThrow();
      });

      it('without .stories.mdx in globs', async () => {
        const packageJson = {
          dependencies: { '@storybook/react': '^7.0.0' },
        };
        const main = {
          stories: [
            '../src/**/*.stories.@(js|jsx|ts|tsx)',
            { directory: '../**', files: '*.stories.@(js|jsx|ts|tsx)' },
            { directory: '../**' },
          ],
        };
        await expect(checkBareMdxStoriesGlob({ packageJson, main })).resolves.toBeFalsy();
      });
    });
  });
  describe('should fix', () => {
    it.each([
      {
        existingStoriesEntries: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
        expectedStoriesEntries: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
      },
      {
        existingStoriesEntries: ['../src/**/*.stories.*'],
        expectedStoriesEntries: ['../src/**/*.@(mdx|stories.*)'],
      },
      {
        existingStoriesEntries: ['../src/**/*.stories.@(mdx|js|jsx|ts|tsx)'],
        expectedStoriesEntries: ['../src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
      },
      {
        existingStoriesEntries: ['../src/**/*.stories.@(js|jsx|mdx|ts|tsx)'],
        expectedStoriesEntries: ['../src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
      },
      {
        existingStoriesEntries: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
        expectedStoriesEntries: ['../src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
      },
    ])(
      'strings: $existingStoriesEntries',
      async ({ existingStoriesEntries, expectedStoriesEntries }) => {
        const packageJson = {
          dependencies: { '@storybook/react': '^7.0.0' },
        };
        const main = {
          stories: existingStoriesEntries,
        };
        await expect(checkBareMdxStoriesGlob({ packageJson, main })).resolves.toMatchObject({
          existingStoriesEntries,
          nextStoriesEntries: expectedStoriesEntries,
        });
      }
    );
    it.each([
      {
        existingStoriesEntries: [{ directory: '../src/**', files: '*.stories.mdx' }],
        expectedStoriesEntries: [{ directory: '../src/**', files: '*.mdx' }],
      },
      {
        existingStoriesEntries: [{ directory: '../src/**', files: '*.stories.*' }],
        expectedStoriesEntries: [{ directory: '../src/**', files: '*.@(mdx|stories.*)' }],
      },
      {
        existingStoriesEntries: [
          { directory: '../src/**', files: '*.stories.@(js|jsx|ts|tsx|mdx)' },
        ],
        expectedStoriesEntries: [
          { directory: '../src/**', files: '*.@(mdx|stories.@(js|jsx|ts|tsx))' },
        ],
      },
    ])(
      'specifiers: $existingStoriesEntries.0.files',
      async ({ existingStoriesEntries, expectedStoriesEntries }) => {
        const packageJson = {
          dependencies: { '@storybook/react': '^7.0.0' },
        };
        const main = {
          stories: existingStoriesEntries,
        };
        await expect(checkBareMdxStoriesGlob({ packageJson, main })).resolves.toMatchObject({
          existingStoriesEntries,
          nextStoriesEntries: expectedStoriesEntries,
        });
      }
    );

    it('prompts', () => {
      const result = bareMdxStoriesGlob.prompt({
        existingStoriesEntries: [
          '../src/**/*.stories.@(js|jsx|mdx|ts|tsx)',
          { directory: '../src/**', files: '*.stories.mdx' },
        ],
        nextStoriesEntries: [
          '../src/**/*.mdx',
          '../src/**/*.stories.@(js|jsx|ts|tsx)',
          { directory: '../src/**', files: '*.mdx' },
        ],
      } as BareMdxStoriesGlobRunOptions);

      expect(result.replaceAll(ansiRegex(), '')).toMatchInlineSnapshot(`
        "We've detected your project has one or more globs in your 'stories' config that matches .stories.mdx files:
          \\"../src/**/*.stories.@(js|jsx|mdx|ts|tsx)\\"
          {
            \\"directory\\": \\"../src/**\\",
            \\"files\\": \\"*.stories.mdx\\"
          }

        In Storybook 7, we have deprecated defining stories in MDX files, and consequently have changed the suffix to simply .mdx.

        We can automatically migrate your 'stories' config to include any .mdx file instead of just .stories.mdx.
        That would result in the following 'stories' config:
          \\"../src/**/*.mdx\\"
          \\"../src/**/*.stories.@(js|jsx|ts|tsx)\\"
          {
            \\"directory\\": \\"../src/**\\",
            \\"files\\": \\"*.mdx\\"
          }

        To learn more about this change, see: https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#mdx-docs-files"
      `);
    });
  });
});
