import type { StorybookConfig } from '@storybook/types';
import { getFrameworkInfo } from './get-framework-info';
import { getActualPackageJson } from './package-json';

jest.mock('./package-json', () => ({
  getActualPackageJson: jest.fn(),
}));

describe('getFrameworkInfo', () => {
  it('should return an empty object if mainConfig.framework is undefined', async () => {
    const result = await getFrameworkInfo({} as StorybookConfig);
    expect(result).toEqual({});
  });

  it('should return an empty object if mainConfig.framework name is undefined', async () => {
    const result = await getFrameworkInfo({ framework: {} } as StorybookConfig);
    expect(result).toEqual({});
  });

  it('should call getActualPackageJson with the correct package name', async () => {
    const packageName = '@storybook/react';
    const framework = { name: packageName };
    await getFrameworkInfo({ framework } as StorybookConfig);
    expect(getActualPackageJson).toHaveBeenCalledWith(packageName);
  });

  it('should resolve the framework package json correctly and strip project paths in the metadata', async () => {
    const packageName = '/path/to/project/@storybook/react';
    const framework = { name: packageName };
    const frameworkPackageJson = {
      name: packageName,
      dependencies: {
        '@storybook/react': '7.0.0',
        '@storybook/builder-vite': '7.0.0',
      },
    };

    jest.spyOn(process, 'cwd').mockReturnValue('/path/to/project');

    (getActualPackageJson as jest.Mock).mockResolvedValueOnce(frameworkPackageJson);

    const result = await getFrameworkInfo({ framework } as StorybookConfig);

    expect(getActualPackageJson).toHaveBeenCalledWith(packageName);

    expect(result).toEqual({
      framework: {
        name: '$SNIP/@storybook/react',
        options: undefined,
      },
      builder: '@storybook/builder-vite',
      renderer: '@storybook/react',
    });
  });
});
