import { describe, it, expect, vi } from 'vitest';
import {
  UpgradeStorybookToLowerVersionError,
  UpgradeStorybookToSameVersionError,
} from '@storybook/core-events/server-errors';
import { doUpgrade, getStorybookVersion } from './upgrade';

import type * as sbcc from '@storybook/core-common';

const findInstallationsMock = vi.fn<string[], Promise<sbcc.InstallationMetadata | undefined>>();

vi.mock('@storybook/telemetry');
vi.mock('@storybook/core-common', async (importOriginal) => {
  const originalModule = (await importOriginal()) as typeof sbcc;
  return {
    ...originalModule,
    JsPackageManagerFactory: {
      getPackageManager: () => ({
        findInstallations: findInstallationsMock,
      }),
    },
    versions: Object.keys(originalModule.versions).reduce(
      (acc, key) => {
        acc[key] = '8.0.0';
        return acc;
      },
      {} as Record<string, string>
    ),
  };
});

describe.each([
  ['│ │ │ ├── @babel/code-frame@7.10.3 deduped', null],
  [
    '│ ├── @storybook/theming@6.0.0-beta.37 extraneous',
    { package: '@storybook/theming', version: '6.0.0-beta.37' },
  ],
  [
    '├─┬ @storybook/preset-create-react-app@3.1.2',
    { package: '@storybook/preset-create-react-app', version: '3.1.2' },
  ],
  ['│ ├─┬ @storybook/node-logger@5.3.19', { package: '@storybook/node-logger', version: '5.3.19' }],
  [
    'npm ERR! peer dep missing: @storybook/react@>=5.2, required by @storybook/preset-create-react-app@3.1.2',
    null,
  ],
])('getStorybookVersion', (input, output) => {
  it(`${input}`, () => {
    expect(getStorybookVersion(input)).toEqual(output);
  });
});

describe('Upgrade errors', () => {
  it('should throw an error when upgrading to a lower version number', async () => {
    findInstallationsMock.mockResolvedValue({
      dependencies: {
        '@storybook/cli': [
          {
            version: '8.1.0',
          },
        ],
      },
      duplicatedDependencies: {},
      infoCommand: '',
      dedupeCommand: '',
    });

    await expect(doUpgrade({} as any)).rejects.toThrowError(UpgradeStorybookToLowerVersionError);
    expect(findInstallationsMock).toHaveBeenCalledWith(['storybook', '@storybook/cli']);
  });
  it('should throw an error when upgrading to the same version number', async () => {
    findInstallationsMock.mockResolvedValue({
      dependencies: {
        '@storybook/cli': [
          {
            version: '8.0.0',
          },
        ],
      },
      duplicatedDependencies: {},
      infoCommand: '',
      dedupeCommand: '',
    });

    await expect(doUpgrade({} as any)).rejects.toThrowError(UpgradeStorybookToSameVersionError);
    expect(findInstallationsMock).toHaveBeenCalledWith(['storybook', '@storybook/cli']);
  });
});
