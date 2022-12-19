/* eslint-disable no-underscore-dangle */
import path from 'path';
import type { JsPackageManager } from '../../js-package-manager';
import { nextjsFramework } from './nextjs-framework';

// eslint-disable-next-line global-require, jest/no-mocks-import
jest.mock('fs-extra', () => require('../../../../../__mocks__/fs-extra'));

const checkNextjsFramework = async ({ packageJson, main }: any) => {
  if (main) {
    // eslint-disable-next-line global-require
    require('fs-extra').__setMockFiles({
      [path.join('.storybook', 'main.js')]: `module.exports = ${JSON.stringify(main)};`,
    });
  }
  const packageManager = {
    retrievePackageJson: () => ({ dependencies: {}, devDependencies: {}, ...packageJson }),
  } as JsPackageManager;
  return nextjsFramework.check({ packageManager });
};

describe('nextjs-framework fix', () => {
  describe('should no-op', () => {
    it('in sb < 7', async () => {
      const packageJson = { dependencies: { '@storybook/react': '^6.2.0' } };
      await expect(
        checkNextjsFramework({
          packageJson,
          main: {},
        })
      ).resolves.toBeFalsy();
    });

    it('in sb 7 with no main', async () => {
      const packageJson = { dependencies: { '@storybook/react': '^7.0.0' } };
      await expect(
        checkNextjsFramework({
          packageJson,
          main: undefined,
        })
      ).resolves.toBeFalsy();
    });

    it('in sb 7 with no framework field in main', async () => {
      const packageJson = { dependencies: { '@storybook/react': '^7.0.0' } };
      await expect(
        checkNextjsFramework({
          packageJson,
          main: {},
        })
      ).resolves.toBeFalsy();
    });

    it('in sb 7 in non-nextjs projects', async () => {
      const packageJson = { dependencies: { '@storybook/react': '^7.0.0' } };
      await expect(
        checkNextjsFramework({
          packageJson,
          main: {
            framework: '@storybook/react',
          },
        })
      ).resolves.toBeFalsy();
    });

    it('in sb 7 with unsupported package', async () => {
      const packageJson = { dependencies: { '@storybook/riot': '^7.0.0' } };
      await expect(
        checkNextjsFramework({
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
  });

  describe('sb >= 7', () => {
    it('should update from @storybook/react-webpack5 to @storybook/nextjs', async () => {
      const packageJson = {
        dependencies: {
          '@storybook/react': '^7.0.0-alpha.0',
          '@storybook/react-webpack5': '^7.0.0-alpha.0',
          next: '^12.0.0',
        },
      };
      await expect(
        checkNextjsFramework({
          packageJson,
          main: {
            framework: '@storybook/react-webpack5',
          },
        })
      ).resolves.toEqual(expect.objectContaining({}));
    });

    it('should remove legacy addons', async () => {
      const packageJson = {
        dependencies: {
          '@storybook/react': '^7.0.0-alpha.0',
          '@storybook/react-webpack5': '^7.0.0-alpha.0',
          next: '^12.0.0',
          'storybook-addon-next': '^1.0.0',
          'storybook-addon-next-router': '^1.0.0',
        },
      };
      await expect(
        checkNextjsFramework({
          packageJson,
          main: {
            framework: '@storybook/react-webpack5',
            addons: ['storybook-addon-next', 'storybook-addon-next-router'],
          },
        })
      ).resolves.toEqual(
        expect.objectContaining({
          addonsToRemove: ['storybook-addon-next', 'storybook-addon-next-router'],
        })
      );
    });

    it('should move nextjs addon options to frameworkOptions', async () => {
      const packageJson = {
        dependencies: {
          '@storybook/react': '^7.0.0-alpha.0',
          '@storybook/react-webpack5': '^7.0.0-alpha.0',
          next: '^12.0.0',
          'storybook-addon-next': '^1.0.0',
        },
      };
      await expect(
        checkNextjsFramework({
          packageJson,
          main: {
            framework: { name: '@storybook/react-webpack5', options: { fastRefresh: true } },
            addons: [
              {
                name: 'storybook-addon-next',
                options: {
                  nextConfigPath: '../next.config.js',
                },
              },
            ],
          },
        })
      ).resolves.toEqual(
        expect.objectContaining({
          addonsToRemove: ['storybook-addon-next'],
          frameworkOptions: {
            fastRefresh: true,
            nextConfigPath: '../next.config.js',
          },
        })
      );
    });

    it('should warn for @storybook/react-vite users', async () => {
      const consoleSpy = jest.spyOn(console, 'info');
      const packageJson = {
        dependencies: {
          '@storybook/react': '^7.0.0-alpha.0',
          '@storybook/react-vite': '^7.0.0-alpha.0',
          next: '^12.0.0',
          'storybook-addon-next': '^1.0.0',
        },
      };
      await expect(
        checkNextjsFramework({
          packageJson,
          main: {
            framework: { name: '@storybook/react-vite' },
          },
        })
      ).resolves.toBeFalsy();

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Vite builder'));
    });
  });
});
