import type { StorybookConfig } from '@storybook/types';
import type { PackageJson } from '../../js-package-manager';
import { makePackageManager, mockStorybookData } from '../helpers/testing-helpers';
import { webpack5 } from './webpack5';

const checkWebpack5 = async ({
  packageJson,
  main: mainConfig,
  storybookVersion = '6.3.0',
}: {
  packageJson: PackageJson;
  main?: Partial<StorybookConfig> & Record<string, unknown>;
  storybookVersion?: string;
}) => {
  mockStorybookData({ mainConfig, storybookVersion });

  return webpack5.check({
    packageManager: makePackageManager(packageJson),
    configDir: '',
  });
};

describe('webpack5 fix', () => {
  afterEach(jest.restoreAllMocks);

  describe('sb < 6.3', () => {
    describe('webpack5 dependency', () => {
      const packageJson = { dependencies: { '@storybook/react': '^6.2.0', webpack: '^5.0.0' } };
      it('should fail', async () => {
        await expect(
          checkWebpack5({
            packageJson,
            storybookVersion: '6.2.0',
          })
        ).rejects.toThrow();
      });
    });
    describe('no webpack5 dependency', () => {
      const packageJson = { dependencies: { '@storybook/react': '^6.2.0' } };
      it('should no-op', async () => {
        await expect(
          checkWebpack5({
            packageJson,
            storybookVersion: '6.2.0',
          })
        ).resolves.toBeFalsy();
      });
    });
  });
  describe('sb 6.3 - 7.0', () => {
    describe('webpack5 dependency', () => {
      const packageJson = { dependencies: { '@storybook/react': '^6.3.0', webpack: '^5.0.0' } };
      describe('webpack5 builder', () => {
        it('should no-op', async () => {
          await expect(
            checkWebpack5({
              packageJson,
              main: { core: { builder: 'webpack5' } },
            })
          ).resolves.toBeFalsy();
        });
      });
      describe('custom builder', () => {
        it('should no-op', async () => {
          await expect(
            checkWebpack5({
              packageJson,
              main: { core: { builder: 'storybook-builder-vite' } },
            })
          ).resolves.toBeFalsy();
        });
      });
      describe('webpack4 builder', () => {
        it('should add webpack5 builder', async () => {
          await expect(
            checkWebpack5({
              packageJson,
              main: { core: { builder: 'webpack4' } },
            })
          ).resolves.toMatchObject({
            webpackVersion: '^5.0.0',
            storybookVersion: '6.3.0',
          });
        });
      });
      describe('no builder', () => {
        it('should add webpack5 builder', async () => {
          await expect(
            checkWebpack5({
              packageJson,
              main: {},
            })
          ).resolves.toMatchObject({
            webpackVersion: '^5.0.0',
            storybookVersion: '6.3.0',
          });
        });
      });
    });
    describe('no webpack dependency', () => {
      it('should no-op', async () => {
        await expect(
          checkWebpack5({
            packageJson: {},
          })
        ).resolves.toBeFalsy();
      });
    });
    describe('webpack4 dependency', () => {
      it('should no-op', async () => {
        await expect(
          checkWebpack5({
            packageJson: {
              dependencies: {
                webpack: '4',
              },
            },
          })
        ).resolves.toBeFalsy();
      });
    });
  });
  describe('sb 7.0+', () => {
    describe('webpack5 dependency', () => {
      const packageJson = {
        dependencies: { '@storybook/react': '^7.0.0-alpha.0', webpack: '^5.0.0' },
      };
      it('should no-op', async () => {
        await expect(
          checkWebpack5({
            packageJson,
            main: {},
            storybookVersion: '7.0.0',
          })
        ).resolves.toBeFalsy();
      });
    });
  });
});
