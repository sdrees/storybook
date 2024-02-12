import { expect, it } from 'vitest';

import type { StorybookConfig } from '@storybook/types';
import type { JsPackageManager } from '@storybook/core-common';
import { removeJestTestingLibrary } from './remove-jest-testing-library';
import ansiRegex from 'ansi-regex';

const check = async ({
  packageManager,
  main: mainConfig = {},
  storybookVersion = '8.0.0',
}: {
  packageManager: Partial<JsPackageManager>;
  main?: Partial<StorybookConfig> & Record<string, unknown>;
  storybookVersion?: string;
}) => {
  return removeJestTestingLibrary.check({
    packageManager: packageManager as any,
    configDir: '',
    mainConfig: mainConfig as any,
    storybookVersion,
  });
};

it('should prompt to install the test package and run the codemod', async () => {
  const options = await check({
    packageManager: {
      getAllDependencies: async () => ({
        '@storybook/jest': '1.0.0',
        '@storybook/testing-library': '1.0.0',
      }),
    },
    main: { addons: ['@storybook/essentials', '@storybook/addon-info'] },
  });

  await expect(options).toMatchInlineSnapshot(`
    {
      "incompatiblePackages": [
        "@storybook/jest",
        "@storybook/testing-library",
      ],
    }
  `);

  expect.addSnapshotSerializer({
    serialize: (value) => {
      const stringVal = typeof value === 'string' ? value : value.toString();
      return stringVal.replace(ansiRegex(), '');
    },
    test: () => true,
  });

  expect(await removeJestTestingLibrary.prompt(options!)).toMatchInlineSnapshot(`
    Attention: We've detected that you're using the following packages which are known to be incompatible with Storybook 8:

    - @storybook/jest
    - @storybook/testing-library

    Install the replacement for those packages: @storybook/test

    And run the following codemod:
     npx storybook migrate migrate-to-test-package --glob="**/*.stories.@(js|jsx|ts|tsx)"
  `);
});
