import { Yarn2Proxy } from './Yarn2Proxy';

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

      expect(executeCommandSpy).toHaveBeenCalledWith('yarn', ['install'], expect.any(String));
    });
  });

  describe('runScript', () => {
    it('should execute script `yarn compodoc -- -e json -d .`', () => {
      const executeCommandSpy = jest.spyOn(yarn2Proxy, 'executeCommand').mockReturnValue('7.1.0');

      yarn2Proxy.runPackageCommand('compodoc', ['-e', 'json', '-d', '.']);

      expect(executeCommandSpy).toHaveBeenLastCalledWith(
        'yarn',
        ['compodoc', '-e', 'json', '-d', '.'],
        undefined,
        undefined
      );
    });
  });

  describe('setRegistryUrl', () => {
    it('should run `yarn config set npmRegistryServer https://foo.bar`', () => {
      const executeCommandSpy = jest.spyOn(yarn2Proxy, 'executeCommand').mockReturnValue('');

      yarn2Proxy.setRegistryURL('https://foo.bar');

      expect(executeCommandSpy).toHaveBeenCalledWith('npm', [
        'config',
        'set',
        'registry',
        'https://foo.bar',
      ]);
    });
  });

  describe('addDependencies', () => {
    it('with devDep it should run `yarn install -D @storybook/preview-api`', () => {
      const executeCommandSpy = jest.spyOn(yarn2Proxy, 'executeCommand').mockReturnValue('');

      yarn2Proxy.addDependencies({ installAsDevDependencies: true }, ['@storybook/preview-api']);

      expect(executeCommandSpy).toHaveBeenCalledWith(
        'yarn',
        ['add', '-D', '@storybook/preview-api'],
        expect.any(String)
      );
    });
  });

  describe('removeDependencies', () => {
    it('should run `yarn remove @storybook/preview-api`', () => {
      const executeCommandSpy = jest.spyOn(yarn2Proxy, 'executeCommand').mockReturnValue('');

      yarn2Proxy.removeDependencies({}, ['@storybook/preview-api']);

      expect(executeCommandSpy).toHaveBeenCalledWith(
        'yarn',
        ['remove', '@storybook/preview-api'],
        expect.any(String)
      );
    });

    it('skipInstall should only change package.json without running install', () => {
      const executeCommandSpy = jest.spyOn(yarn2Proxy, 'executeCommand').mockReturnValue('7.0.0');
      const writePackageSpy = jest
        .spyOn(yarn2Proxy, 'writePackageJson')
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
        .mockReturnValue('{"name":"@storybook/preview-api","version":"5.3.19"}');

      const version = await yarn2Proxy.latestVersion('@storybook/preview-api');

      expect(executeCommandSpy).toHaveBeenCalledWith('yarn', [
        'npm',
        'info',
        '@storybook/preview-api',
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
          '{"name":"@storybook/preview-api","versions":["4.25.3","5.3.19","6.0.0-beta.23"]}'
        );

      const version = await yarn2Proxy.latestVersion('@storybook/preview-api', '5.X');

      expect(executeCommandSpy).toHaveBeenCalledWith('yarn', [
        'npm',
        'info',
        '@storybook/preview-api',
        '--fields',
        'versions',
        '--json',
      ]);
      expect(version).toEqual('5.3.19');
    });

    it('throws an error if command output is not a valid JSON', async () => {
      jest.spyOn(yarn2Proxy, 'executeCommand').mockReturnValue('NOT A JSON');

      await expect(yarn2Proxy.latestVersion('@storybook/preview-api')).rejects.toThrow();
    });
  });

  describe('addPackageResolutions', () => {
    it('adds resolutions to package.json and account for existing resolutions', () => {
      const writePackageSpy = jest
        .spyOn(yarn2Proxy, 'writePackageJson')
        .mockImplementation(jest.fn);

      jest.spyOn(yarn2Proxy, 'retrievePackageJson').mockImplementation(
        jest.fn(() => ({
          dependencies: {},
          devDependencies: {},
          resolutions: {
            bar: 'x.x.x',
          },
        }))
      );

      const versions = {
        foo: 'x.x.x',
      };
      yarn2Proxy.addPackageResolutions(versions);

      expect(writePackageSpy).toHaveBeenCalledWith({
        dependencies: {},
        devDependencies: {},
        resolutions: {
          ...versions,
          bar: 'x.x.x',
        },
      });
    });
  });
});
