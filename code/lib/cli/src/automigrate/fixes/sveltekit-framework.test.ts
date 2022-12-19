/* eslint-disable no-underscore-dangle */
import type { StorybookConfig } from 'lib/types/src';
import path from 'path';
import type { JsPackageManager, PackageJson } from '../../js-package-manager';
import { sveltekitFramework } from './sveltekit-framework';

// eslint-disable-next-line global-require, jest/no-mocks-import
jest.mock('fs-extra', () => require('../../../../../__mocks__/fs-extra'));

const checkSvelteKitFramework = async ({
  packageJson,
  main,
}: {
  packageJson: PackageJson;
  main?: Partial<StorybookConfig>;
}) => {
  if (main) {
    // eslint-disable-next-line global-require
    require('fs-extra').__setMockFiles({
      [path.join('.storybook', 'main.js')]: `module.exports = ${JSON.stringify(main)};`,
    });
  } else {
    // eslint-disable-next-line global-require
    require('fs-extra').__setMockFiles({});
  }
  const packageManager = {
    retrievePackageJson: () => ({ dependencies: {}, devDependencies: {}, ...packageJson }),
  } as JsPackageManager;

  return sveltekitFramework.check({ packageManager });
};

describe('SvelteKit framework fix', () => {
  describe('should no-op', () => {
    it('in SB < v7.0.0', async () => {
      const packageJson = {
        dependencies: { '@sveltejs/kit': '^1.0.0-next.571', '@storybook/svelte': '^6.2.0' },
      };
      const main = { framework: '@storybook/svelte-vite' };
      await expect(checkSvelteKitFramework({ packageJson, main })).resolves.toBeFalsy();
    });

    describe('in SB >= v7.0.0', () => {
      it('in non-SvelteKit projects', async () => {
        const packageJson = {
          dependencies: { svelte: '^3.53.1', '@storybook/svelte-vite': '^7.0.0' },
        };
        const main = {
          framework: '@storybook/svelte-vite',
        };
        await expect(checkSvelteKitFramework({ packageJson, main })).resolves.toBeFalsy();
      });

      it('without main', async () => {
        const packageJson = {
          dependencies: { '@sveltejs/kit': '^1.0.0-next.571', '@storybook/svelte': '^7.0.0' },
        };
        await expect(checkSvelteKitFramework({ packageJson })).rejects.toThrow();
      });

      it('without framework field in main', async () => {
        const packageJson = {
          dependencies: { '@sveltejs/kit': '^1.0.0-next.571', '@storybook/svelte': '^7.0.0' },
        };
        const main = {};
        await expect(checkSvelteKitFramework({ packageJson, main })).rejects.toThrow();
      });

      it('with unsupported framework', async () => {
        const packageJson = {
          dependencies: {
            '@sveltejs/kit': '^1.0.0-next.571',
            '@storybook/svelte-vite': '^7.0.0',
            '@storybook/html': '^7.0.0',
          },
        };
        const main = {
          framework: '@storybook/html',
        };
        await expect(checkSvelteKitFramework({ packageJson, main })).rejects.toThrow();
      });

      it('with unsupported framework+builder from SB 6.5', async () => {
        const packageJson = {
          dependencies: {
            '@sveltejs/kit': '^1.0.0-next.571',
            '@storybook/svelte-webpack5': '^7.0.0',
            '@storybook/svelte': '^7.0.0',
          },
        };
        const main = {
          framework: '@storybook/svelte',
          core: { builder: '@storybook/builder-webpack5' },
        };
        await expect(checkSvelteKitFramework({ packageJson, main })).rejects.toThrow();
      });

      it('with @storybook/svelte-webpack5 framework', async () => {
        const packageJson = {
          dependencies: {
            '@storybook/svelte': '^7.0.0',
            '@storybook/svelte-webpack5': '^7.0.0',
            '@sveltejs/kit': '^1.0.0-next.571',
          },
        };
        const main = {
          framework: '@storybook/svelte-webpack5',
        };
        await expect(checkSvelteKitFramework({ packageJson, main })).rejects.toThrow();
      });
    });
  });

  describe('should migrate', () => {
    it('from @storybook/svelte-vite', async () => {
      const packageJson = {
        dependencies: {
          '@storybook/svelte': '^7.0.0',
          '@storybook/svelte-vite': '^7.0.0',
          '@sveltejs/kit': '^1.0.0-next.571',
        },
      };
      const main = {
        framework: '@storybook/svelte-vite',
      };
      await expect(checkSvelteKitFramework({ packageJson, main })).resolves.toMatchObject({
        packageJson,
        main: expect.objectContaining({}),
        dependenciesToRemove: ['@storybook/svelte-vite'],
      });
    });

    it('from @storybook/svelte framework and @storybook/builder-vite builder', async () => {
      const packageJson = {
        dependencies: {
          '@storybook/svelte': '^7.0.0',
          '@storybook/builder-vite': '^7.0.0',
          '@sveltejs/kit': '^1.0.0-next.571',
        },
      };
      const main = {
        framework: '@storybook/svelte',
        core: { builder: '@storybook/builder-vite' },
      };
      await expect(checkSvelteKitFramework({ packageJson, main })).resolves.toMatchObject({
        packageJson,
        main: expect.objectContaining({}),
        dependenciesToRemove: ['@storybook/builder-vite'],
      });
    });

    it('from @storybook/svelte framework and storybook-builder-vite builder', async () => {
      const packageJson = {
        dependencies: {
          '@storybook/svelte': '^7.0.0',
          'storybook-builder-vite': '^0.2.5',
          '@sveltejs/kit': '^1.0.0-next.571',
        },
      };
      const main = {
        framework: '@storybook/svelte',
        core: { builder: 'storybook-builder-vite' },
      };
      await expect(checkSvelteKitFramework({ packageJson, main })).resolves.toMatchObject({
        packageJson,
        main: expect.objectContaining({}),
        dependenciesToRemove: ['storybook-builder-vite'],
      });
    });
  });
});
