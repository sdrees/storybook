/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
import path from 'path';
import { run as version } from '../version';

// eslint-disable-next-line jest/no-mocks-import
jest.mock('fs-extra', () => require('../../../code/__mocks__/fs-extra'));
const fsExtra = require('fs-extra');

jest.mock('../../../code/lib/cli/src/versions', () => ({
  '@storybook/addon-a11y': '7.1.0-alpha.29',
}));

jest.mock('../../utils/exec');
const { execaCommand } = require('../../utils/exec');

jest.mock('../../utils/workspace', () => ({
  getWorkspaces: jest.fn().mockResolvedValue([
    {
      name: '@storybook/addon-a11y',
      location: 'addons/a11y',
    },
  ]),
}));

jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Version', () => {
  const CODE_DIR_PATH = path.join(__dirname, '..', '..', '..', 'code');
  const CODE_PACKAGE_JSON_PATH = path.join(CODE_DIR_PATH, 'package.json');
  const MANAGER_API_VERSION_PATH = path.join(
    CODE_DIR_PATH,
    'lib',
    'manager-api',
    'src',
    'version.ts'
  );
  const VERSIONS_PATH = path.join(CODE_DIR_PATH, 'lib', 'cli', 'src', 'versions.ts');
  const A11Y_PACKAGE_JSON_PATH = path.join(CODE_DIR_PATH, 'addons', 'a11y', 'package.json');

  it('should throw when release type is invalid', async () => {
    fsExtra.__setMockFiles({
      [CODE_PACKAGE_JSON_PATH]: JSON.stringify({ version: '1.0.0' }),
      [MANAGER_API_VERSION_PATH]: `export const version = "1.0.0";`,
      [VERSIONS_PATH]: `export default { "@storybook/addon-a11y": "1.0.0" };`,
    });

    await expect(version({ releaseType: 'invalid' })).rejects.toThrowErrorMatchingInlineSnapshot(`
      "[
        {
          "received": "invalid",
          "code": "invalid_enum_value",
          "options": [
            "major",
            "minor",
            "patch",
            "prerelease",
            "premajor",
            "preminor",
            "prepatch"
          ],
          "path": [
            "releaseType"
          ],
          "message": "Invalid enum value. Expected 'major' | 'minor' | 'patch' | 'prerelease' | 'premajor' | 'preminor' | 'prepatch', received 'invalid'"
        }
      ]"
    `);
  });

  it('should throw when prerelease identifier is combined with non-pre release type', async () => {
    fsExtra.__setMockFiles({
      [CODE_PACKAGE_JSON_PATH]: JSON.stringify({ version: '1.0.0' }),
      [MANAGER_API_VERSION_PATH]: `export const version = "1.0.0";`,
      [VERSIONS_PATH]: `export default { "@storybook/addon-a11y": "1.0.0" };`,
    });

    await expect(version({ releaseType: 'major', preId: 'alpha' })).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      "[
        {
          "code": "custom",
          "message": "Using prerelease identifier requires one of release types: premajor, preminor, prepatch, prerelease",
          "path": []
        }
      ]"
    `);
  });

  it('should throw when exact is combined with release type', async () => {
    fsExtra.__setMockFiles({
      [CODE_PACKAGE_JSON_PATH]: JSON.stringify({ version: '1.0.0' }),
      [MANAGER_API_VERSION_PATH]: `export const version = "1.0.0";`,
      [VERSIONS_PATH]: `export default { "@storybook/addon-a11y": "1.0.0" };`,
    });

    await expect(version({ releaseType: 'major', exact: '1.0.0' })).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      "[
        {
          "code": "custom",
          "message": "Combining --exact with --release-type is invalid, but having one of them is required",
          "path": []
        }
      ]"
    `);
  });

  it('should throw when exact is invalid semver', async () => {
    fsExtra.__setMockFiles({
      [CODE_PACKAGE_JSON_PATH]: JSON.stringify({ version: '1.0.0' }),
      [MANAGER_API_VERSION_PATH]: `export const version = "1.0.0";`,
      [VERSIONS_PATH]: `export default { "@storybook/addon-a11y": "1.0.0" };`,
    });

    await expect(version({ exact: 'not-semver' })).rejects.toThrowErrorMatchingInlineSnapshot(`
      "[
        {
          "code": "custom",
          "message": "--exact version has to be a valid semver string",
          "path": [
            "exact"
          ]
        }
      ]"
    `);
  });

  it.each([
    // prettier-ignore
    { releaseType: 'major', currentVersion: '1.1.1', expectedVersion: '2.0.0' },
    // prettier-ignore
    { releaseType: 'minor', currentVersion: '1.1.1', expectedVersion: '1.2.0' },
    // prettier-ignore
    { releaseType: 'patch', currentVersion: '1.1.1', expectedVersion: '1.1.2' },
    // prettier-ignore
    { releaseType: 'premajor', preId: 'alpha', currentVersion: '1.1.1', expectedVersion: '2.0.0-alpha.0' },
    // prettier-ignore
    { releaseType: 'preminor', preId: 'alpha', currentVersion: '1.1.1', expectedVersion: '1.2.0-alpha.0' },
    // prettier-ignore
    { releaseType: 'prepatch', preId: 'alpha', currentVersion: '1.1.1', expectedVersion: '1.1.2-alpha.0' },
    // prettier-ignore
    { releaseType: 'prerelease', currentVersion: '1.1.1-alpha.5', expectedVersion: '1.1.1-alpha.6' },
    // prettier-ignore
    { releaseType: 'prerelease', preId: 'alpha', currentVersion: '1.1.1-alpha.5', expectedVersion: '1.1.1-alpha.6' },
    // prettier-ignore
    { releaseType: 'prerelease', preId: 'beta', currentVersion: '1.1.1-alpha.10', expectedVersion: '1.1.1-beta.0' },
    // prettier-ignore
    { releaseType: 'major', currentVersion: '1.1.1-rc.10', expectedVersion: '2.0.0' },
    // prettier-ignore
    { releaseType: 'minor', currentVersion: '1.1.1-rc.10', expectedVersion: '1.2.0' },
    // prettier-ignore
    { releaseType: 'patch', currentVersion: '1.1.1-rc.10', expectedVersion: '1.1.1' },
    // prettier-ignore
    { exact: '4.2.0-canary.69', currentVersion: '1.1.1-rc.10', expectedVersion: '4.2.0-canary.69' },
  ])(
    'bump with type: "$releaseType", pre id "$preId" or exact "$exact", from: $currentVersion, to: $expectedVersion',
    async ({ releaseType, preId, exact, currentVersion, expectedVersion }) => {
      fsExtra.__setMockFiles({
        [CODE_PACKAGE_JSON_PATH]: JSON.stringify({ version: currentVersion }),
        [MANAGER_API_VERSION_PATH]: `export const version = "${currentVersion}";`,
        [VERSIONS_PATH]: `export default { "@storybook/addon-a11y": "${currentVersion}" };`,
        [A11Y_PACKAGE_JSON_PATH]: JSON.stringify({
          version: currentVersion,
          dependencies: {
            '@storybook/core-server': currentVersion,
            'unrelated-package-a': '1.0.0',
          },
          devDependencies: {
            'unrelated-package-b': currentVersion,
            '@storybook/core-common': `^${currentVersion}`,
          },
          peerDependencies: {
            '@storybook/preview-api': `*`,
            '@storybook/svelte': '0.1.1',
            '@storybook/manager-api': `~${currentVersion}`,
          },
        }),
        [VERSIONS_PATH]: `export default { "@storybook/addon-a11y": "${currentVersion}" };`,
      });

      await version({ releaseType, preId, exact });

      expect(fsExtra.writeJson).toHaveBeenCalledWith(
        CODE_PACKAGE_JSON_PATH,
        { version: expectedVersion },
        { spaces: 2 }
      );
      expect(fsExtra.writeFile).toHaveBeenCalledWith(
        MANAGER_API_VERSION_PATH,
        `export const version = "${expectedVersion}";`
      );
      expect(fsExtra.writeFile).toHaveBeenCalledWith(
        VERSIONS_PATH,
        `export default { "@storybook/addon-a11y": "${expectedVersion}" };`
      );
      expect(fsExtra.writeJson).toHaveBeenCalledWith(
        A11Y_PACKAGE_JSON_PATH,
        expect.objectContaining({
          // should update package version
          version: expectedVersion,
          dependencies: {
            // should update storybook dependencies matching current version
            '@storybook/core-server': expectedVersion,
            'unrelated-package-a': '1.0.0',
          },
          devDependencies: {
            // should not update non-storybook dependencies, even if they match current version
            'unrelated-package-b': currentVersion,
            // should update dependencies with range modifiers correctly (e.g. ^1.0.0 -> ^2.0.0)
            '@storybook/core-common': `^${expectedVersion}`,
          },
          peerDependencies: {
            // should not update storybook depenedencies if they don't match current version
            '@storybook/preview-api': `*`,
            '@storybook/svelte': '0.1.1',
            '@storybook/manager-api': `~${expectedVersion}`,
          },
        }),
        { spaces: 2 }
      );
      expect(execaCommand).toHaveBeenCalledWith('yarn install --mode=update-lockfile', {
        cwd: path.join(CODE_DIR_PATH),
        stdio: undefined,
      });
    }
  );
});
