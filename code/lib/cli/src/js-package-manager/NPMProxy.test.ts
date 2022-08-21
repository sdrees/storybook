import { NPMProxy } from './NPMProxy';

describe('NPM Proxy', () => {
  let npmProxy: NPMProxy;

  beforeEach(() => {
    npmProxy = new NPMProxy();
  });

  it('type should be npm', () => {
    expect(npmProxy.type).toEqual('npm');
  });

  describe('initPackageJson', () => {
    it('should run `npm init -y`', () => {
      const executeCommandSpy = jest.spyOn(npmProxy, 'executeCommand').mockReturnValue('');

      npmProxy.initPackageJson();

      expect(executeCommandSpy).toHaveBeenCalledWith('npm', ['init', '-y']);
    });
  });

  describe('setRegistryUrl', () => {
    it('should run `npm config set registry https://foo.bar`', () => {
      const executeCommandSpy = jest.spyOn(npmProxy, 'executeCommand').mockReturnValue('');

      npmProxy.setRegistryURL('https://foo.bar');

      expect(executeCommandSpy).toHaveBeenCalledWith('npm', [
        'config',
        'set',
        'registry',
        'https://foo.bar',
      ]);
    });
  });

  describe('installDependencies', () => {
    describe('npm6', () => {
      it('should run `npm install`', () => {
        const executeCommandSpy = jest.spyOn(npmProxy, 'executeCommand').mockReturnValue('6.0.0');

        npmProxy.installDependencies();

        expect(executeCommandSpy).toHaveBeenLastCalledWith('npm', ['install'], expect.any(String));
      });
    });
    describe('npm7', () => {
      it('should run `npm install --legacy-peer-deps`', () => {
        const executeCommandSpy = jest.spyOn(npmProxy, 'executeCommand').mockReturnValue('7.1.0');

        npmProxy.installDependencies();

        expect(executeCommandSpy).toHaveBeenLastCalledWith(
          'npm',
          ['install', '--legacy-peer-deps'],
          expect.any(String)
        );
      });
    });
  });

  describe('addDependencies', () => {
    describe('npm6', () => {
      it('with devDep it should run `npm install -D @storybook/addons`', () => {
        const executeCommandSpy = jest.spyOn(npmProxy, 'executeCommand').mockReturnValue('6.0.0');

        npmProxy.addDependencies({ installAsDevDependencies: true }, ['@storybook/addons']);

        expect(executeCommandSpy).toHaveBeenLastCalledWith(
          'npm',
          ['install', '-D', '@storybook/addons'],
          expect.any(String)
        );
      });
    });
    describe('npm7', () => {
      it('with devDep it should run `npm install -D @storybook/addons`', () => {
        const executeCommandSpy = jest.spyOn(npmProxy, 'executeCommand').mockReturnValue('7.0.0');

        npmProxy.addDependencies({ installAsDevDependencies: true }, ['@storybook/addons']);

        expect(executeCommandSpy).toHaveBeenLastCalledWith(
          'npm',
          ['install', '--legacy-peer-deps', '-D', '@storybook/addons'],
          expect.any(String)
        );
      });
    });
  });

  describe('removeDependencies', () => {
    describe('npm6', () => {
      it('with devDep it should run `npm uninstall @storybook/addons`', () => {
        const executeCommandSpy = jest.spyOn(npmProxy, 'executeCommand').mockReturnValue('6.0.0');

        npmProxy.removeDependencies({}, ['@storybook/addons']);

        expect(executeCommandSpy).toHaveBeenLastCalledWith(
          'npm',
          ['uninstall', '@storybook/addons'],
          expect.any(String)
        );
      });
    });
    describe('npm7', () => {
      it('with devDep it should run `npm uninstall @storybook/addons`', () => {
        const executeCommandSpy = jest.spyOn(npmProxy, 'executeCommand').mockReturnValue('7.0.0');

        npmProxy.removeDependencies({}, ['@storybook/addons']);

        expect(executeCommandSpy).toHaveBeenLastCalledWith(
          'npm',
          ['uninstall', '--legacy-peer-deps', '@storybook/addons'],
          expect.any(String)
        );
      });
    });
    describe('skipInstall', () => {
      it('should only change package.json without running install', () => {
        const executeCommandSpy = jest.spyOn(npmProxy, 'executeCommand').mockReturnValue('7.0.0');
        const writePackageSpy = jest
          .spyOn(npmProxy, 'writePackageJson')
          .mockImplementation(jest.fn);

        npmProxy.removeDependencies(
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
  });

  describe('latestVersion', () => {
    it('without constraint it returns the latest version', async () => {
      const executeCommandSpy = jest.spyOn(npmProxy, 'executeCommand').mockReturnValue('"5.3.19"');

      const version = await npmProxy.latestVersion('@storybook/addons');

      expect(executeCommandSpy).toHaveBeenCalledWith('npm', [
        'info',
        '@storybook/addons',
        'version',
        '--json',
      ]);
      expect(version).toEqual('5.3.19');
    });

    it('with constraint it returns the latest version satisfying the constraint', async () => {
      const executeCommandSpy = jest
        .spyOn(npmProxy, 'executeCommand')
        .mockReturnValue('["4.25.3","5.3.19","6.0.0-beta.23"]');

      const version = await npmProxy.latestVersion('@storybook/addons', '5.X');

      expect(executeCommandSpy).toHaveBeenCalledWith('npm', [
        'info',
        '@storybook/addons',
        'versions',
        '--json',
      ]);
      expect(version).toEqual('5.3.19');
    });

    it('throws an error if command output is not a valid JSON', async () => {
      jest.spyOn(npmProxy, 'executeCommand').mockReturnValue('NOT A JSON');

      await expect(npmProxy.latestVersion('@storybook/addons')).rejects.toThrow();
    });
  });

  describe('getVersion', () => {
    it('with a Storybook package listed in versions.json it returns the version', async () => {
      // eslint-disable-next-line global-require
      const storybookAngularVersion = require('../versions').default['@storybook/angular'];
      const executeCommandSpy = jest.spyOn(npmProxy, 'executeCommand').mockReturnValue('"5.3.19"');

      const version = await npmProxy.getVersion('@storybook/angular');

      expect(executeCommandSpy).toHaveBeenCalledWith('npm', [
        'info',
        '@storybook/angular',
        'version',
        '--json',
      ]);
      expect(version).toEqual(`^${storybookAngularVersion}`);
    });

    it('with a Storybook package not listed in versions.json it returns the latest version', async () => {
      const packageVersion = '5.3.19';
      const executeCommandSpy = jest
        .spyOn(npmProxy, 'executeCommand')
        .mockReturnValue(`"${packageVersion}"`);

      const version = await npmProxy.getVersion('@storybook/react-native');

      expect(executeCommandSpy).toHaveBeenCalledWith('npm', [
        'info',
        '@storybook/react-native',
        'version',
        '--json',
      ]);
      expect(version).toEqual(`^${packageVersion}`);
    });
  });

  describe('addPackageResolutions', () => {
    it('adds resolutions to package.json and account for existing resolutions', () => {
      const writePackageSpy = jest.spyOn(npmProxy, 'writePackageJson').mockImplementation(jest.fn);

      jest.spyOn(npmProxy, 'retrievePackageJson').mockImplementation(
        jest.fn(() => ({
          overrides: {
            bar: 'x.x.x',
          },
        }))
      );

      const versions = {
        foo: 'x.x.x',
      };
      npmProxy.addPackageResolutions(versions);

      expect(writePackageSpy).toHaveBeenCalledWith({
        overrides: {
          ...versions,
          bar: 'x.x.x',
        },
      });
    });
  });
});
