import type { JsPackageManager, PackageJson } from '../../js-package-manager';
import type { GetStorybookData } from './mainConfigFile';
import * as mainConfigFile from './mainConfigFile';

jest.mock('./mainConfigFile', () => ({
  ...jest.requireActual('./mainConfigFile'),
  getStorybookData: jest.fn(),
}));

jest.mock('@storybook/core-common', () => ({
  ...jest.requireActual('@storybook/core-common'),
  loadMainConfig: jest.fn(),
}));

export const makePackageManager = (packageJson: PackageJson) => {
  const { dependencies = {}, devDependencies = {}, peerDependencies = {} } = packageJson;
  return {
    retrievePackageJson: async () => ({ dependencies: {}, devDependencies: {}, ...packageJson }),
    getAllDependencies: async () => ({
      ...dependencies,
      ...devDependencies,
      ...peerDependencies,
    }),
  } as JsPackageManager;
};

type GetStorybookDataParams = Awaited<ReturnType<GetStorybookData>>;
export const mockStorybookData = (
  mockData: {
    mainConfig: Partial<GetStorybookDataParams['mainConfig']> & Record<string, unknown>;
    storybookVersion: GetStorybookDataParams['storybookVersion'];
  } & Partial<Omit<GetStorybookDataParams, 'mainConfig' | 'storybookVersion'>>
) => {
  const defaults: Partial<GetStorybookDataParams> = {
    configDir: '',
    mainConfigPath: '',
  };

  jest.spyOn(mainConfigFile, 'getStorybookData').mockResolvedValueOnce({
    ...defaults,
    ...mockData,
  } as GetStorybookDataParams);
};
