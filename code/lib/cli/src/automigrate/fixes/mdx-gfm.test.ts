import type { StorybookConfig } from '@storybook/types';
import type { PackageJson } from '../../js-package-manager';
import { makePackageManager, mockStorybookData } from '../helpers/testing-helpers';
import { mdxgfm } from './mdx-gfm';

const check = async ({
  packageJson,
  main: mainConfig,
  storybookVersion = '7.0.0',
}: {
  packageJson: PackageJson;
  main: Partial<StorybookConfig> & Record<string, unknown>;
  storybookVersion?: string;
}) => {
  mockStorybookData({ mainConfig, storybookVersion });

  return mdxgfm.check({
    packageManager: makePackageManager(packageJson),
    configDir: '',
  });
};

describe('no-ops', () => {
  const packageJson = {};
  test('sb > 7.0', async () => {
    await expect(
      check({
        packageJson,
        main: {},
        storybookVersion: '6.2.0',
      })
    ).resolves.toBeFalsy();
  });
  test('legacyMdx1', async () => {
    await expect(
      check({
        packageJson,
        main: {
          features: {
            legacyMdx1: true,
          },
        },
      })
    ).resolves.toBeFalsy();
  });
  test('with addon docs setup', async () => {
    await expect(
      check({
        packageJson,
        main: {
          addons: [
            {
              name: '@storybook/addon-essentials',
              options: {
                docs: false,
              },
            },
            {
              name: '@storybook/addon-docs',
              options: {
                mdxPluginOptions: {
                  mdxCompileOptions: {
                    remarkPlugins: [() => {}],
                  },
                },
              },
            },
          ],
        },
      })
    ).resolves.toBeFalsy();
  });
  test('with addon migration assistant addon added', async () => {
    await expect(
      check({
        packageJson,
        main: {
          addons: ['@storybook/addon-mdx-gfm'],
        },
      })
    ).resolves.toBeFalsy();
  });
});

describe('continue', () => {
  const packageJson = {};
  test('nothing configured at all', async () => {
    await expect(
      check({
        packageJson,
        main: {},
      })
    ).resolves.toBeTruthy();
  });
  test('unconfigured addon-docs', async () => {
    await expect(
      check({
        packageJson,
        main: {
          addons: [
            {
              name: '@storybook/addon-essentials',
              options: {
                docs: false,
              },
            },
            {
              name: '@storybook/addon-docs',
              options: {},
            },
          ],
        },
      })
    ).resolves.toBeTruthy();
  });
  test('unconfigured addon-essentials', async () => {
    await expect(
      check({
        packageJson,
        main: {
          addons: ['@storybook/addon-essentials'],
        },
      })
    ).resolves.toBeTruthy();
  });
});
