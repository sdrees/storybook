import type { StorybookConfig } from '@storybook/types';
import type { PackageJson } from '../../js-package-manager';
import { makePackageManager, mockStorybookData } from '../helpers/testing-helpers';
import { cra5 } from './cra5';

const checkCra5 = async ({
  packageJson,
  main: mainConfig,
  storybookVersion = '7.0.0',
}: {
  packageJson: PackageJson;
  main?: Partial<StorybookConfig> & Record<string, unknown>;
  storybookVersion?: string;
}) => {
  mockStorybookData({ mainConfig, storybookVersion });

  return cra5.check({
    packageManager: makePackageManager(packageJson),
  });
};

describe('cra5 fix', () => {
  afterEach(jest.restoreAllMocks);

  describe('sb < 6.3', () => {
    describe('cra5 dependency', () => {
      const packageJson = {
        dependencies: { '@storybook/react': '^6.2.0', 'react-scripts': '^5.0.0' },
      };
      it('should fail', async () => {
        await expect(
          checkCra5({
            packageJson,
            storybookVersion: '6.2.0',
          })
        ).rejects.toThrow();
      });
    });
    describe('no cra5 dependency', () => {
      const packageJson = { dependencies: { '@storybook/react': '^6.2.0' } };
      it('should no-op', async () => {
        await expect(
          checkCra5({
            packageJson,
            main: {},
          })
        ).resolves.toBeFalsy();
      });
    });
  });
  describe('sb 6.3 - 7.0', () => {
    describe('cra5 dependency', () => {
      const packageJson = {
        dependencies: { '@storybook/react': '^6.3.0', 'react-scripts': '^5.0.0' },
      };
      describe('webpack5 builder', () => {
        it('should no-op', async () => {
          await expect(
            checkCra5({
              packageJson,
              main: { core: { builder: 'webpack5' } },
            })
          ).resolves.toBeFalsy();
        });
      });
      describe('custom builder', () => {
        it('should no-op', async () => {
          await expect(
            checkCra5({
              packageJson,
              main: { core: { builder: 'storybook-builder-vite' } },
            })
          ).resolves.toBeFalsy();
        });
      });
      describe('webpack4 builder', () => {
        it('should add webpack5 builder', async () => {
          await expect(
            checkCra5({
              packageJson,
              main: { core: { builder: 'webpack4' } },
              storybookVersion: '6.3.0',
            })
          ).resolves.toMatchObject({
            craVersion: '^5.0.0',
            storybookVersion: '6.3.0',
          });
        });
      });
      describe('no builder', () => {
        it('should add webpack5 builder', async () => {
          await expect(
            checkCra5({
              packageJson,
              main: {},
              storybookVersion: '6.3.0',
            })
          ).resolves.toMatchObject({
            craVersion: '^5.0.0',
            storybookVersion: '6.3.0',
          });
        });
      });
    });
    describe('no cra dependency', () => {
      it('should no-op', async () => {
        await expect(
          checkCra5({
            packageJson: {},
            main: {},
          })
        ).resolves.toBeFalsy();
      });
    });
    describe('cra4 dependency', () => {
      it('should no-op', async () => {
        await expect(
          checkCra5({
            packageJson: {
              dependencies: {
                'react-scripts': '4',
              },
            },
            main: {},
          })
        ).resolves.toBeFalsy();
      });
    });
  });
  describe('sb 7.0+', () => {
    describe('cra5 dependency', () => {
      const packageJson = {
        dependencies: { '@storybook/react': '^7.0.0-alpha.0', 'react-scripts': '^5.0.0' },
      };
      it('should no-op', async () => {
        await expect(
          checkCra5({
            packageJson,
            main: {},
          })
        ).resolves.toBeFalsy();
      });
    });
  });
});
