/* eslint-disable no-underscore-dangle */
/// <reference types="@types/jest" />;

import type { StorybookConfig } from '@storybook/types';
import type { PackageJson } from '../../js-package-manager';
import { makePackageManager, mockStorybookData } from '../helpers/testing-helpers';
import { missingBabelRc } from './missing-babelrc';

// eslint-disable-next-line global-require, jest/no-mocks-import
jest.mock('fs-extra', () => require('../../../../../__mocks__/fs-extra'));

const babelContent = JSON.stringify({
  sourceType: 'unambiguous',
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: 100,
        },
      },
    ],
    '@babel/preset-typescript',
    '@babel/preset-react',
  ],
  plugins: [],
});

const check = async ({
  packageJson = {},
  main: mainConfig,
  storybookVersion = '7.0.0',
  extraFiles,
}: {
  packageJson?: PackageJson;
  main?: Partial<StorybookConfig> & Record<string, unknown>;
  storybookVersion?: string;
  extraFiles?: Record<string, any>;
}) => {
  if (extraFiles) {
    // eslint-disable-next-line global-require
    require('fs-extra').__setMockFiles(extraFiles);
  }

  mockStorybookData({ mainConfig, storybookVersion });

  return missingBabelRc.check({ packageManager: makePackageManager(packageJson) });
};

describe('missing-babelrc fix', () => {
  afterEach(jest.restoreAllMocks);

  it('skips when storybook version < 7.0.0', async () => {
    await expect(check({ storybookVersion: '6.3.2' })).resolves.toBeNull();
  });

  it('skips when babelrc config is present', async () => {
    const packageJson = {
      devDependencies: {
        '@storybook/react': '^7.0.0',
        '@storybook/react-webpack5': '^7.0.0',
      },
    };

    // different babel extensions
    await expect(
      check({
        extraFiles: { '.babelrc': babelContent },
        packageJson,
        main: { framework: '@storybook/react' },
      })
    ).resolves.toBeNull();
    await expect(
      check({
        extraFiles: { '.babelrc.json': babelContent },
        packageJson,
        main: { framework: '@storybook/react' },
      })
    ).resolves.toBeNull();
    await expect(
      check({
        extraFiles: { 'babel.config.json': babelContent },
        packageJson,
        main: { framework: '@storybook/react' },
      })
    ).resolves.toBeNull();

    // babel field in package.json
    await expect(
      check({
        packageJson: { ...packageJson, babel: babelContent },
        main: { framework: '@storybook/react' },
      })
    ).resolves.toBeNull();
  });

  it('skips when using a framework that provides babel config', async () => {
    const packageJson = {
      devDependencies: {
        '@storybook/react': '^7.0.0',
        '@storybook/nextjs': '^7.0.0',
      },
    };

    await expect(
      check({ packageJson, main: { framework: '@storybook/nextjs' } })
    ).resolves.toBeNull();
  });

  it('skips when using CRA preset', async () => {
    const packageJson = {
      devDependencies: {
        '@storybook/react': '^7.0.0',
        '@storybook/react-webpack5': '^7.0.0',
      },
    };

    await expect(
      check({
        packageJson,
        main: { framework: '@storybook/react', addons: ['@storybook/preset-create-react-app'] },
      })
    ).resolves.toBeNull();
  });

  it('prompts when babelrc file is missing and framework does not provide babel config', async () => {
    const packageJson = {
      devDependencies: {
        '@storybook/react': '^7.0.0',
        '@storybook/react-webpack5': '^7.0.0',
      },
    };

    await expect(
      check({ main: { framework: '@storybook/react-webpack5' }, packageJson })
    ).resolves.toEqual({
      needsBabelRc: true,
    });
  });
});
