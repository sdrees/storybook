import type { StorybookConfig } from '@storybook/types';
import { reactDocgen } from './react-docgen';

const check = async ({
  packageManager,
  main: mainConfig,
  storybookVersion = '7.0.0',
}: {
  packageManager: any;
  main: Partial<StorybookConfig> & Record<string, unknown>;
  storybookVersion?: string;
}) => {
  return reactDocgen.check({
    packageManager,
    configDir: '',
    mainConfig: mainConfig as any,
    storybookVersion,
  });
};

describe('no-ops', () => {
  test('typescript.reactDocgen is already set', async () => {
    await expect(
      check({
        packageManager: {},
        main: {
          typescript: {
            // @ts-expect-error assume react
            reactDocgen: 'react-docgen-typescript',
          },
        },
      })
    ).resolves.toBeFalsy();

    await expect(
      check({
        packageManager: {},
        main: {
          typescript: {
            // @ts-expect-error assume react
            reactDocgen: false,
          },
        },
      })
    ).resolves.toBeFalsy();
  });
  test('typescript.reactDocgen and typescript.reactDocgenTypescriptOptions are both unset', async () => {
    await expect(
      check({
        packageManager: {},
        main: {
          typescript: {
            // @ts-expect-error assume react
            reactDocgen: 'react-docgen-typescript',
            reactDocgenTypescriptOptions: undefined,
          },
        },
      })
    ).resolves.toBeFalsy();
  });
});

describe('continue', () => {
  test('typescript.reactDocgenTypescriptOptions is set', async () => {
    await expect(
      check({
        packageManager: {},
        main: {
          typescript: {
            // @ts-expect-error assume react
            reactDocgenTypescriptOptions: {},
          },
        },
      })
    ).resolves.toBeTruthy();
  });
});
