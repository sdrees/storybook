import { Yarn2Proxy } from './Yarn2Proxy';
import * as PackageJsonHelper from './PackageJsonHelper';

describe('Yarn 2 Proxy', () => {
  let yarn2Proxy: Yarn2Proxy;

  beforeEach(() => {
    yarn2Proxy = new Yarn2Proxy();
  });

  it('type should be yarn2', () => {
    expect(yarn2Proxy.type).toEqual('yarn2');
  });

  describe('initPackageJson', () => {
    it('should run `yarn init`', () => {
      const executeCommandSpy = jest.spyOn(yarn2Proxy, 'executeCommand').mockReturnValue('');

      yarn2Proxy.initPackageJson();

      expect(executeCommandSpy).toHaveBeenCalledWith('yarn', ['init']);
    });
  });

  describe('installDependencies', () => {
    it('should run `yarn`', () => {
      const executeCommandSpy = jest.spyOn(yarn2Proxy, 'executeCommand').mockReturnValue('');

      yarn2Proxy.installDependencies();

      expect(executeCommandSpy).toHaveBeenCalledWith('yarn', [], expect.any(String));
    });
  });

  describe('addDependencies', () => {
    it('with devDep it should run `yarn install -D @storybook/addons`', () => {
      const executeCommandSpy = jest.spyOn(yarn2Proxy, 'executeCommand').mockReturnValue('');

      yarn2Proxy.addDependencies({ installAsDevDependencies: true }, ['@storybook/addons']);

      expect(executeCommandSpy).toHaveBeenCalledWith(
        'yarn',
        ['add', '-D', '@storybook/addons'],
        expect.any(String)
      );
    });
  });

  describe('removeDependencies', () => {
    it('it should run `yarn remove @storybook/addons`', () => {
      const executeCommandSpy = jest.spyOn(yarn2Proxy, 'executeCommand').mockReturnValue('');

      yarn2Proxy.removeDependencies({}, ['@storybook/addons']);

      expect(executeCommandSpy).toHaveBeenCalledWith(
        'yarn',
        ['remove', '@storybook/addons'],
        expect.any(String)
      );
    });

    it('skipInstall should only change package.json without running install', () => {
      const executeCommandSpy = jest.spyOn(yarn2Proxy, 'executeCommand').mockReturnValue('7.0.0');
      const writePackageSpy = jest
        .spyOn(PackageJsonHelper, 'writePackageJson')
        .mockImplementation(jest.fn);

      yarn2Proxy.removeDependencies(
        {
          skipInstall: true,
          packageJson: {
            devDependencies: {
              '@storybook/manager-webpack5': 'x.x.x',
              '@storybook/react': 'x.x.x',
            },
          },
        },
        ['@storybook/manager-webpack5']
      );

      expect(writePackageSpy).toHaveBeenCalledWith({
        devDependencies: {
          '@storybook/react': 'x.x.x',
        },
      });
      expect(executeCommandSpy).not.toHaveBeenCalled();
    });
  });

  describe('latestVersion', () => {
    it('without constraint it returns the latest version', async () => {
      const executeCommandSpy = jest
        .spyOn(yarn2Proxy, 'executeCommand')
        .mockReturnValue('{"name":"@storybook/addons","version":"5.3.19"}');

      const version = await yarn2Proxy.latestVersion('@storybook/addons');

      expect(executeCommandSpy).toHaveBeenCalledWith('yarn', [
        'npm',
        'info',
        '@storybook/addons',
        '--fields',
        'version',
        '--json',
      ]);
      expect(version).toEqual('5.3.19');
    });

    it('with constraint it returns the latest version satisfying the constraint', async () => {
      const executeCommandSpy = jest
        .spyOn(yarn2Proxy, 'executeCommand')
        .mockReturnValue(
          '{"name":"@storybook/addons","versions":["4.25.3","5.3.19","6.0.0-beta.23"]}'
        );

      const version = await yarn2Proxy.latestVersion('@storybook/addons', '5.X');

      expect(executeCommandSpy).toHaveBeenCalledWith('yarn', [
        'npm',
        'info',
        '@storybook/addons',
        '--fields',
        'versions',
        '--json',
      ]);
      expect(version).toEqual('5.3.19');
    });

    it('throws an error if command output is not a valid JSON', async () => {
      jest.spyOn(yarn2Proxy, 'executeCommand').mockReturnValue('NOT A JSON');

      await expect(yarn2Proxy.latestVersion('@storybook/addons')).rejects.toThrow();
    });
  });
});
