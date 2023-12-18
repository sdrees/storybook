import type { StorybookConfig } from '@storybook/types';
import { glob } from 'glob';
import { removeReactDependency } from './prompt-remove-react';
import type { JsPackageManager } from '../../js-package-manager';

const check = async ({
  packageManagerContent,
  main: mainConfig,
  storybookVersion = '8.0.0',
}: {
  packageManagerContent: Pick<
    Partial<Awaited<ReturnType<JsPackageManager['retrievePackageJson']>>>,
    'dependencies' | 'devDependencies' | 'peerDependencies'
  >;
  main: Partial<StorybookConfig> & Record<string, unknown>;
  storybookVersion?: string;
}) => {
  const packageManager = {
    retrievePackageJson: async () => packageManagerContent,
  } as JsPackageManager;

  return removeReactDependency.check({
    packageManager,
    configDir: '',
    mainConfig: mainConfig as any,
    storybookVersion,
  });
};

jest.mock('glob', () => ({ glob: jest.fn(() => []) }));

describe('early exits', () => {
  test('cancel if storybookVersion < 8', async () => {
    await expect(
      check({
        packageManagerContent: {
          dependencies: { react: '16.0.0' },
        },
        main: {
          stories: [],
          framework: '@storybook/vue-vite',
        },
        storybookVersion: '7.0.0',
      })
    ).resolves.toBeFalsy();
  });

  test('cancel if no react deps', async () => {
    await expect(
      check({
        packageManagerContent: {},
        main: {
          stories: [],
          framework: '@storybook/vue-vite',
        },
      })
    ).resolves.toBeFalsy();
  });

  test('cancel if react renderer', async () => {
    await expect(
      check({
        packageManagerContent: {
          dependencies: { react: '16.0.0' },
        },
        main: {
          stories: [],
          framework: '@storybook/react-vite',
        },
      })
    ).resolves.toBeFalsy();

    await expect(
      check({
        packageManagerContent: {
          dependencies: { react: '16.0.0' },
        },
        main: {
          stories: [],
          framework: '@storybook/nextjs',
        },
      })
    ).resolves.toBeFalsy();

    await expect(
      check({
        packageManagerContent: {
          dependencies: { react: '16.0.0' },
        },
        main: {
          stories: [],
          framework: { name: '@storybook/react-webpack5' },
        },
      })
    ).resolves.toBeFalsy();
  });
});

describe('prompts', () => {
  test('simple', async () => {
    await expect(
      check({
        packageManagerContent: {
          dependencies: { react: '16.0.0' },
        },
        main: {
          stories: ['*.stories.ts'],
          addons: [],
          framework: '@storybook/vue-vite',
        },
      })
    ).resolves.toEqual(true);
  });
  test('detects addon docs', async () => {
    await expect(
      check({
        packageManagerContent: {
          dependencies: { react: '16.0.0' },
        },
        main: {
          stories: ['*.stories.ts'],
          addons: ['@storybook/addon-docs'],
          framework: '@storybook/vue-vite',
        },
      })
    ).resolves.toEqual(true);
  });
  test('detects addon essentials', async () => {
    await expect(
      check({
        packageManagerContent: {
          dependencies: { react: '16.0.0' },
        },
        main: {
          stories: ['*.stories.ts'],
          addons: ['@storybook/addon-docs', '@storybook/addon-essentials'],
          framework: '@storybook/vue-vite',
        },
      })
    ).resolves.toEqual(true);
  });
  test('detects MDX usage', async () => {
    // @ts-expect-error (jest mocked)
    glob.mockImplementationOnce(() => ['*.stories.mdx']);
    await expect(
      check({
        packageManagerContent: {
          dependencies: { react: '16.0.0' },
        },
        main: {
          stories: ['*.stories.ts'],
          addons: ['@storybook/addon-docs', '@storybook/addon-essentials'],
          framework: '@storybook/vue-vite',
        },
      })
    ).resolves.toEqual(true);
  });
});
