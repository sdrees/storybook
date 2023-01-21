import { PNPMProxy } from './PNPMProxy';

describe('NPM Proxy', () => {
  let pnpmProxy: PNPMProxy;

  beforeEach(() => {
    pnpmProxy = new PNPMProxy();
  });

  it('type should be npm', () => {
    expect(pnpmProxy.type).toEqual('pnpm');
  });

  describe('initPackageJson', () => {
    it('should run `npm init -y`', () => {
      const executeCommandSpy = jest.spyOn(pnpmProxy, 'executeCommand').mockReturnValue('');

      pnpmProxy.initPackageJson();

      expect(executeCommandSpy).toHaveBeenCalledWith('pnpm', ['init', '-y']);
    });
  });

  describe('setRegistryUrl', () => {
    it('should run `npm config set registry https://foo.bar`', () => {
      const executeCommandSpy = jest.spyOn(pnpmProxy, 'executeCommand').mockReturnValue('');

      pnpmProxy.setRegistryURL('https://foo.bar');

      expect(executeCommandSpy).toHaveBeenCalledWith('npm', [
        'config',
        'set',
        'registry',
        'https://foo.bar',
      ]);
    });
  });

  describe('installDependencies', () => {
    it('should run `pnpm install`', () => {
      const executeCommandSpy = jest.spyOn(pnpmProxy, 'executeCommand').mockReturnValue('7.1.0');

      pnpmProxy.installDependencies();

      expect(executeCommandSpy).toHaveBeenLastCalledWith('pnpm', ['install'], expect.any(String));
    });
  });

  describe('runScript', () => {
    it('should execute script `yarn compodoc -- -e json -d .`', () => {
      const executeCommandSpy = jest.spyOn(pnpmProxy, 'executeCommand').mockReturnValue('7.1.0');

      pnpmProxy.runPackageCommand('compodoc', ['-e', 'json', '-d', '.']);

      expect(executeCommandSpy).toHaveBeenLastCalledWith(
        'pnpm',
        ['run', 'compodoc', '-e', 'json', '-d', '.'],
        undefined,
        undefined
      );
    });
  });

  describe('addDependencies', () => {
    it('with devDep it should run `pnpm add -D @storybook/preview-api`', () => {
      const executeCommandSpy = jest.spyOn(pnpmProxy, 'executeCommand').mockReturnValue('6.0.0');

      pnpmProxy.addDependencies({ installAsDevDependencies: true }, ['@storybook/preview-api']);

      expect(executeCommandSpy).toHaveBeenLastCalledWith(
        'pnpm',
        ['add', '-D', '@storybook/preview-api'],
        expect.any(String)
      );
    });
  });

  describe('removeDependencies', () => {
    it('with devDep it should run `npm uninstall @storybook/preview-api`', () => {
      const executeCommandSpy = jest.spyOn(pnpmProxy, 'executeCommand').mockReturnValue('6.0.0');

      pnpmProxy.removeDependencies({}, ['@storybook/preview-api']);

      expect(executeCommandSpy).toHaveBeenLastCalledWith(
        'pnpm',
        ['remove', '@storybook/preview-api'],
        expect.any(String)
      );
    });

    describe('skipInstall', () => {
      it('should only change package.json without running install', () => {
        const executeCommandSpy = jest.spyOn(pnpmProxy, 'executeCommand').mockReturnValue('7.0.0');
        const writePackageSpy = jest
          .spyOn(pnpmProxy, 'writePackageJson')
          .mockImplementation(jest.fn);

        pnpmProxy.removeDependencies(
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
      const executeCommandSpy = jest.spyOn(pnpmProxy, 'executeCommand').mockReturnValue('"5.3.19"');

      const version = await pnpmProxy.latestVersion('@storybook/preview-api');

      expect(executeCommandSpy).toHaveBeenCalledWith('pnpm', [
        'info',
        '@storybook/preview-api',
        'version',
        '--json',
      ]);
      expect(version).toEqual('5.3.19');
    });

    it('with constraint it returns the latest version satisfying the constraint', async () => {
      const executeCommandSpy = jest
        .spyOn(pnpmProxy, 'executeCommand')
        .mockReturnValue('["4.25.3","5.3.19","6.0.0-beta.23"]');

      const version = await pnpmProxy.latestVersion('@storybook/preview-api', '5.X');

      expect(executeCommandSpy).toHaveBeenCalledWith('pnpm', [
        'info',
        '@storybook/preview-api',
        'versions',
        '--json',
      ]);
      expect(version).toEqual('5.3.19');
    });

    it('throws an error if command output is not a valid JSON', async () => {
      jest.spyOn(pnpmProxy, 'executeCommand').mockReturnValue('NOT A JSON');

      await expect(pnpmProxy.latestVersion('@storybook/preview-api')).rejects.toThrow();
    });
  });

  describe('getVersion', () => {
    it('with a Storybook package listed in versions.json it returns the version', async () => {
      // eslint-disable-next-line global-require
      const storybookAngularVersion = require('../versions').default['@storybook/angular'];
      const executeCommandSpy = jest.spyOn(pnpmProxy, 'executeCommand').mockReturnValue('"5.3.19"');

      const version = await pnpmProxy.getVersion('@storybook/angular');

      expect(executeCommandSpy).toHaveBeenCalledWith('pnpm', [
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
        .spyOn(pnpmProxy, 'executeCommand')
        .mockReturnValue(`"${packageVersion}"`);

      const version = await pnpmProxy.getVersion('@storybook/react-native');

      expect(executeCommandSpy).toHaveBeenCalledWith('pnpm', [
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
      const writePackageSpy = jest.spyOn(pnpmProxy, 'writePackageJson').mockImplementation(jest.fn);

      jest.spyOn(pnpmProxy, 'retrievePackageJson').mockImplementation(
        // @ts-expect-error (not strict)
        jest.fn(() => ({
          overrides: {
            bar: 'x.x.x',
          },
        }))
      );

      const versions = {
        foo: 'x.x.x',
      };
      pnpmProxy.addPackageResolutions(versions);

      expect(writePackageSpy).toHaveBeenCalledWith({
        overrides: {
          ...versions,
          bar: 'x.x.x',
        },
      });
    });
  });
});
