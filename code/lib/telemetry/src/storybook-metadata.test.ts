import type { PackageJson, StorybookConfig } from '@storybook/types';

import path from 'path';
import { computeStorybookMetadata, metaFrameworks, sanitizeAddonName } from './storybook-metadata';

const packageJsonMock: PackageJson = {
  name: 'some-user-project',
  version: 'x.x.x',
};

const mainJsMock: StorybookConfig = {
  stories: [],
};

jest.mock('./package-json', () => {
  const getActualPackageVersion = jest.fn((name) =>
    Promise.resolve({
      name,
      version: 'x.x.x',
    })
  );

  const getActualPackageVersions = jest.fn((packages) =>
    Promise.all(Object.keys(packages).map(getActualPackageVersion))
  );

  const getActualPackageJson = jest.fn((name) => ({
    dependencies: {
      '@storybook/react': 'x.x.x',
      '@storybook/builder-vite': 'x.x.x',
    },
  }));

  return {
    getActualPackageVersions,
    getActualPackageVersion,
    getActualPackageJson,
  };
});

jest.mock('./get-monorepo-type', () => ({
  getMonorepoType: () => 'Nx',
}));

jest.mock('detect-package-manager', () => ({
  detect: () => 'Yarn',
  getNpmVersion: () => '3.1.1',
}));

describe('sanitizeAddonName', () => {
  const originalSep = path.sep;
  beforeEach(() => {
    // @ts-expect-error the property is read only but we can change it for testing purposes
    path.sep = originalSep;
  });

  test('special addon names', () => {
    const addonNames = [
      '@storybook/preset-create-react-app',
      'storybook-addon-deprecated/register',
      'storybook-addon-ends-with-js/register.js',
      '@storybook/addon-knobs/preset',
      '@storybook/addon-ends-with-js/preset.js',
      '@storybook/addon-postcss/dist/index.js',
      '../local-addon/register.js',
      '../../',
    ].map(sanitizeAddonName);

    expect(addonNames).toEqual([
      '@storybook/preset-create-react-app',
      'storybook-addon-deprecated',
      'storybook-addon-ends-with-js',
      '@storybook/addon-knobs',
      '@storybook/addon-ends-with-js',
      '@storybook/addon-postcss',
      '../local-addon',
      '../../',
    ]);
  });

  test('Windows paths', () => {
    // @ts-expect-error the property is read only but we can change it for testing purposes
    path.sep = '\\';
    const cwdMockPath = `C:\\Users\\username\\storybook-app`;
    jest.spyOn(process, `cwd`).mockImplementationOnce(() => cwdMockPath);

    expect(sanitizeAddonName(`${cwdMockPath}\\local-addon\\themes.js`)).toEqual(
      '$SNIP\\local-addon\\themes'
    );
  });

  test('Linux paths', () => {
    // @ts-expect-error the property is read only but we can change it for testing purposes
    path.sep = '/';
    const cwdMockPath = `/Users/username/storybook-app`;
    jest.spyOn(process, `cwd`).mockImplementationOnce(() => cwdMockPath);

    expect(sanitizeAddonName(`${cwdMockPath}/local-addon/themes.js`)).toEqual(
      '$SNIP/local-addon/themes'
    );
  });
});

describe('await computeStorybookMetadata', () => {
  test('should return frameworkOptions from mainjs', async () => {
    const reactResult = await computeStorybookMetadata({
      packageJson: packageJsonMock,
      mainConfig: {
        ...mainJsMock,
        framework: {
          name: '@storybook/react-vite',
          options: {
            fastRefresh: false,
          },
        },
      },
    });

    expect(reactResult.framework).toEqual({
      name: '@storybook/react-vite',
      options: { fastRefresh: false },
    });

    const angularResult = await computeStorybookMetadata({
      packageJson: packageJsonMock,
      mainConfig: {
        ...mainJsMock,
        framework: {
          name: '@storybook/angular',
          options: {
            enableIvy: true,
            enableNgcc: true,
          },
        },
      },
    });

    expect(angularResult.framework).toEqual({
      name: '@storybook/angular',
      options: { enableIvy: true, enableNgcc: true },
    });
  });

  test('should separate storybook packages and addons', async () => {
    const result = await computeStorybookMetadata({
      packageJson: {
        ...packageJsonMock,
        devDependencies: {
          '@storybook/react': 'x.y.z',
          '@storybook/addon-essentials': 'x.x.x',
          '@storybook/addon-knobs': 'x.x.y',
          'storybook-addon-deprecated': 'x.x.z',
        },
      },
      mainConfig: {
        ...mainJsMock,
        addons: [
          '@storybook/addon-essentials',
          'storybook-addon-deprecated/register',
          '@storybook/addon-knobs/preset',
        ],
      },
    });

    expect(result.addons).toMatchInlineSnapshot(`
      Object {
        "@storybook/addon-essentials": Object {
          "options": undefined,
          "version": "x.x.x",
        },
        "@storybook/addon-knobs": Object {
          "options": undefined,
          "version": "x.x.x",
        },
        "storybook-addon-deprecated": Object {
          "options": undefined,
          "version": "x.x.x",
        },
      }
    `);
    expect(result.storybookPackages).toMatchInlineSnapshot(`
      Object {
        "@storybook/react": Object {
          "version": "x.x.x",
        },
      }
    `);
  });

  test('should return user specified features', async () => {
    const features = {
      interactionsDebugger: true,
    };

    const result = await computeStorybookMetadata({
      packageJson: packageJsonMock,
      mainConfig: {
        ...mainJsMock,
        features,
      },
    });

    expect(result.features).toEqual(features);
  });

  test('should infer builder and renderer from framework package.json', async () => {
    expect(
      await computeStorybookMetadata({
        packageJson: packageJsonMock,
        mainConfig: {
          ...mainJsMock,
          framework: '@storybook/react-vite',
        },
      })
    ).toMatchObject({
      framework: { name: '@storybook/react-vite' },
      renderer: '@storybook/react',
      builder: '@storybook/builder-vite',
    });
  });

  test('should return the number of refs', async () => {
    const res = await computeStorybookMetadata({
      packageJson: packageJsonMock,
      mainConfig: {
        ...mainJsMock,
        refs: {
          a: { title: '', url: '' },
          b: { title: '', url: '' },
        },
      },
    });
    expect(res.refCount).toEqual(2);
  });

  test.each(Object.entries(metaFrameworks))(
    'should detect the supported metaframework: %s',
    async (metaFramework, name) => {
      const res = await computeStorybookMetadata({
        packageJson: {
          ...packageJsonMock,
          dependencies: {
            [metaFramework]: 'x.x.x',
          },
        },
        mainConfig: mainJsMock,
      });
      expect(res.metaFramework).toEqual({
        name,
        packageName: metaFramework,
        version: 'x.x.x',
      });
    }
  );
});
