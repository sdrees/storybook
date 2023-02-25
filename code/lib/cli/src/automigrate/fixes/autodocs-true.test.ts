import type { StorybookConfig } from '@storybook/types';
import type { PackageJson } from '../../js-package-manager';
import { makePackageManager, mockStorybookData } from '../helpers/testing-helpers';
import { autodocsTrue } from './autodocs-true';

const checkAutodocs = async ({
  packageJson = {},
  main: mainConfig,
  storybookVersion = '7.0.0',
}: {
  packageJson?: PackageJson;
  main: Partial<StorybookConfig> & Record<string, unknown>;
  storybookVersion?: string;
}) => {
  mockStorybookData({ mainConfig, storybookVersion });

  return autodocsTrue.check({
    packageManager: makePackageManager(packageJson),
  });
};

describe('autodocs-true fix', () => {
  afterEach(jest.restoreAllMocks);

  it('should skip when docs.autodocs is already defined', async () => {
    await expect(checkAutodocs({ main: { docs: { autodocs: 'tag' } } })).resolves.toBeFalsy();
  });

  it('should throw when docs.docsPage contains invalid value', async () => {
    const main = { docs: { docsPage: 123 } } as any;
    await expect(checkAutodocs({ main })).rejects.toThrow();
  });

  it('should prompt when using docs.docsPage legacy property', async () => {
    const main = { docs: { docsPage: true } } as any;
    await expect(checkAutodocs({ main })).resolves.toEqual({
      value: 'tag',
    });
  });

  it('should prompt when not using docs.autodocs', async () => {
    await expect(checkAutodocs({ main: {} })).resolves.toEqual({
      value: true,
    });
  });
});
