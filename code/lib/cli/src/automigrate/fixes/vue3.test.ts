import type { StorybookConfig } from '@storybook/types';
import type { PackageJson } from '../../js-package-manager';
import { vue3 } from './vue3';
import { makePackageManager, mockStorybookData } from '../helpers/testing-helpers';

const checkVue3 = async ({
  packageJson,
  main: mainConfig = {},
  storybookVersion = '7.0.0',
}: {
  packageJson: PackageJson;
  main?: Partial<StorybookConfig> & Record<string, unknown>;
  storybookVersion?: string;
}) => {
  mockStorybookData({ mainConfig, storybookVersion });

  return vue3.check({
    packageManager: makePackageManager(packageJson),
  });
};

describe('vue3 fix', () => {
  afterEach(jest.restoreAllMocks);

  describe('sb < 6.3', () => {
    describe('vue3 dependency', () => {
      const packageJson = {
        dependencies: { '@storybook/vue': '^6.2.0', vue: '^3.0.0' },
      };
      it('should fail', async () => {
        await expect(
          checkVue3({
            packageJson,
            storybookVersion: '6.2.0',
          })
        ).rejects.toThrow();
      });
    });
    describe('no vue dependency', () => {
      const packageJson = { dependencies: { '@storybook/vue': '^6.2.0' } };
      it('should no-op', async () => {
        await expect(
          checkVue3({
            packageJson,
            storybookVersion: '6.2.0',
          })
        ).resolves.toBeFalsy();
      });
    });
  });
  describe('sb 6.3 - 7.0', () => {
    describe('vue3 dependency', () => {
      const packageJson = {
        dependencies: { '@storybook/vue': '^6.3.0', vue: '^3.0.0' },
      };
      describe('webpack5 builder', () => {
        it('should no-op', async () => {
          await expect(
            checkVue3({
              packageJson,
              main: { core: { builder: 'webpack5' } },
            })
          ).resolves.toBeFalsy();
        });
      });
      describe('custom builder', () => {
        it('should no-op', async () => {
          await expect(
            checkVue3({
              packageJson,
              main: { core: { builder: 'storybook-builder-vite' } },
            })
          ).resolves.toBeFalsy();
        });
      });
      describe('webpack4 builder', () => {
        it('should add webpack5 builder', async () => {
          await expect(
            checkVue3({
              packageJson,
              main: { core: { builder: 'webpack4' } },
              storybookVersion: '6.3.0',
            })
          ).resolves.toMatchObject({
            vueVersion: '^3.0.0',
            storybookVersion: '6.3.0',
          });
        });
      });
      describe('no builder', () => {
        it('should add webpack5 builder', async () => {
          await expect(
            checkVue3({
              packageJson,
              main: {},
              storybookVersion: '6.3.0',
            })
          ).resolves.toMatchObject({
            vueVersion: '^3.0.0',
            storybookVersion: '6.3.0',
          });
        });
      });
    });
    describe('no vue dependency', () => {
      it('should no-op', async () => {
        await expect(
          checkVue3({
            packageJson: {},
            main: {},
          })
        ).resolves.toBeFalsy();
      });
    });
    describe('vue2 dependency', () => {
      it('should no-op', async () => {
        await expect(
          checkVue3({
            packageJson: {
              dependencies: {
                vue: '2',
              },
            },
            main: {},
          })
        ).resolves.toBeFalsy();
      });
    });
  });
  describe('sb 7.0+', () => {
    describe('vue3 dependency', () => {
      const packageJson = {
        dependencies: { '@storybook/vue': '^7.0.0-alpha.0', vue: '^3.0.0' },
      };
      it('should no-op', async () => {
        await expect(
          checkVue3({
            packageJson,
            main: {},
          })
        ).resolves.toBeFalsy();
      });
    });
  });
});
