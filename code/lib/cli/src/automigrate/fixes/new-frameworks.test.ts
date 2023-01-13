/* eslint-disable no-underscore-dangle */
import * as path from 'path';
import type { StorybookConfig } from '@storybook/types';
import type { JsPackageManager, PackageJson } from '../../js-package-manager';
import { newFrameworks } from './new-frameworks';

// eslint-disable-next-line global-require, jest/no-mocks-import
jest.mock('fs-extra', () => require('../../../../../__mocks__/fs-extra'));

const checkNewFrameworks = async ({
  packageJson,
  main,
}: {
  packageJson: PackageJson;
  main: Partial<StorybookConfig> & Record<string, unknown>;
}) => {
  if (main) {
    // eslint-disable-next-line global-require
    require('fs-extra').__setMockFiles({
      [path.join('.storybook', 'main.js')]: `module.exports = ${JSON.stringify(main)};`,
    });
  }
  const packageManager = {
    retrievePackageJson: () => ({ dependencies: {}, devDependencies: {}, ...packageJson }),
  } as JsPackageManager;
  return newFrameworks.check({ packageManager });
};

describe('new-frameworks fix', () => {
  describe('should no-op', () => {
    it('in sb < 7', async () => {
      const packageJson = { dependencies: { '@storybook/vue': '^6.2.0' } };
      await expect(
        checkNewFrameworks({
          packageJson,
          main: {},
        })
      ).resolves.toBeFalsy();
    });

    it('in sb 7 with no main', async () => {
      const packageJson = { dependencies: { '@storybook/vue': '^7.0.0' } };
      await expect(
        checkNewFrameworks({
          packageJson,
          main: undefined,
        })
      ).resolves.toBeFalsy();
    });

    it('in sb 7 with no framework field in main', async () => {
      const packageJson = { dependencies: { '@storybook/vue': '^7.0.0' } };
      await expect(
        checkNewFrameworks({
          packageJson,
          main: {},
        })
      ).resolves.toBeFalsy();
    });

    it('in sb 7 with no builder', async () => {
      const packageJson = { dependencies: { '@storybook/vue': '^7.0.0' } };
      await expect(
        checkNewFrameworks({
          packageJson,
          main: {
            framework: '@storybook/vue',
          },
        })
      ).resolves.toEqual(
        expect.objectContaining({
          frameworkPackage: '@storybook/vue-webpack5',
          dependenciesToAdd: ['@storybook/vue-webpack5'],
          dependenciesToRemove: [],
        })
      );
    });

    it('in sb 7 with unsupported package', async () => {
      const packageJson = { dependencies: { '@storybook/riot': '^7.0.0' } };
      await expect(
        checkNewFrameworks({
          packageJson,
          main: {
            framework: '@storybook/riot',
            core: {
              builder: 'webpack5',
            },
          },
        })
      ).resolves.toBeFalsy();
    });

    // TODO: once we have a @storybook/vue-vite framework, we should remove this test
    it('in sb 7 with vue and vite', async () => {
      const packageJson = {
        dependencies: {
          '@storybook/vue': '^7.0.0',
          '@storybook/builder-vite': 'x.y.z',
        },
      };
      await expect(
        checkNewFrameworks({
          packageJson,
          main: {
            framework: '@storybook/vue',
            core: {
              builder: '@storybook/builder-vite',
            },
          },
        })
      ).resolves.toBeFalsy();
    });

    it('in sb 7 with vite < 3', async () => {
      const packageJson = {
        dependencies: {
          '@storybook/react': '^7.0.0',
          '@storybook/builder-vite': 'x.y.z',
          vite: '^2.0.0',
        },
      };
      await expect(
        checkNewFrameworks({
          packageJson,
          main: {
            framework: '@storybook/react',
            core: {
              builder: '@storybook/builder-vite',
            },
          },
        })
      ).rejects.toBeTruthy();
    });
  });

  describe('sb >= 7', () => {
    describe('new-frameworks dependency', () => {
      it('should update to @storybook/react-webpack5', async () => {
        const packageJson = {
          dependencies: {
            '@storybook/react': '^7.0.0-alpha.0',
            '@storybook/builder-webpack5': '^6.5.9',
            '@storybook/manager-webpack5': '^6.5.9',
          },
        };
        await expect(
          checkNewFrameworks({
            packageJson,
            main: {
              framework: '@storybook/react',
              core: {
                builder: {
                  name: 'webpack5',
                  options: {
                    lazyCompilation: true,
                  },
                },
              },
              reactOptions: {
                fastRefresh: true,
              },
            },
          })
        ).resolves.toEqual(
          expect.objectContaining({
            frameworkPackage: '@storybook/react-webpack5',
            dependenciesToAdd: ['@storybook/react-webpack5'],
            dependenciesToRemove: ['@storybook/builder-webpack5', '@storybook/manager-webpack5'],
            frameworkOptions: {
              fastRefresh: true,
            },
            builderInfo: {
              name: 'webpack5',
              options: {
                lazyCompilation: true,
              },
            },
          })
        );
      });

      it('should update only builders in @storybook/angular', async () => {
        const packageJson = {
          dependencies: {
            '@storybook/angular': '^7.0.0-alpha.0',
            '@storybook/builder-webpack5': '^6.5.9',
            '@storybook/manager-webpack5': '^6.5.9',
          },
        };
        await expect(
          checkNewFrameworks({
            packageJson,
            main: {
              framework: '@storybook/angular',
              core: {
                builder: {
                  name: 'webpack5',
                  options: {
                    lazyCompilation: true,
                  },
                },
              },
              angularOptions: {
                enableIvy: true,
                enableNgcc: true,
              },
            },
          })
        ).resolves.toEqual(
          expect.objectContaining({
            frameworkPackage: '@storybook/angular',
            dependenciesToAdd: [],
            dependenciesToRemove: ['@storybook/builder-webpack5', '@storybook/manager-webpack5'],
            frameworkOptions: {
              enableIvy: true,
              enableNgcc: true,
            },
            builderInfo: {
              name: 'webpack5',
              options: {
                lazyCompilation: true,
              },
            },
          })
        );
      });

      it('should update to @storybook/react-vite', async () => {
        const packageJson = {
          dependencies: {
            '@storybook/react': '^7.0.0-alpha.0',
            '@storybook/builder-vite': '^0.0.2',
            vite: '3.0.0',
          },
        };
        await expect(
          checkNewFrameworks({
            packageJson,
            main: {
              framework: '@storybook/react',
              core: {
                builder: '@storybook/builder-vite',
              },
            },
          })
        ).resolves.toEqual(
          expect.objectContaining({
            frameworkPackage: '@storybook/react-vite',
            dependenciesToAdd: ['@storybook/react-vite'],
            dependenciesToRemove: ['@storybook/builder-vite'],
          })
        );
      });

      it('should update to @storybook/preact-vite', async () => {
        const packageJson = {
          dependencies: {
            '@storybook/preact': '^7.0.0-alpha.0',
            '@storybook/builder-vite': '^0.0.2',
            vite: '3.0.0',
          },
        };
        await expect(
          checkNewFrameworks({
            packageJson,
            main: {
              framework: '@storybook/preact',
              core: {
                builder: '@storybook/builder-vite',
              },
            },
          })
        ).resolves.toEqual(
          expect.objectContaining({
            frameworkPackage: '@storybook/preact-vite',
            dependenciesToAdd: ['@storybook/preact-vite'],
            dependenciesToRemove: ['@storybook/builder-vite'],
          })
        );
      });
    });
  });
});
