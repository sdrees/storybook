import type { JsPackageManager, PackageJson } from '../../js-package-manager';
import { getStorybookScripts, sbScripts } from './sb-scripts';

const checkSbScripts = async ({ packageJson }: { packageJson: PackageJson }) => {
  const packageManager = {
    retrievePackageJson: () => ({ dependencies: {}, devDependencies: {}, ...packageJson }),
  } as JsPackageManager;
  return sbScripts.check({ packageManager });
};

describe('getStorybookScripts', () => {
  it('detects default storybook scripts', () => {
    expect(
      getStorybookScripts({
        start: 'server start',
        storybook: 'start-storybook',
        'build-storybook': 'build-storybook',
      })
    ).toEqual({
      official: {
        storybook: 'start-storybook',
        'build-storybook': 'build-storybook',
      },
      custom: {},
    });
  });

  it('skips non-storybook scripts', () => {
    expect(
      getStorybookScripts({
        start: 'server start',
        'storybook:start-ci': 'CI=true yarn start-storybook',
        'storybook:build-ci': 'CI=true yarn build-storybook',
      })
    ).toEqual({
      custom: {
        'storybook:start-ci': 'CI=true yarn start-storybook',
        'storybook:build-ci': 'CI=true yarn build-storybook',
      },
      official: {},
    });
  });

  it('works with custom storybook scripts', () => {
    expect(
      getStorybookScripts({
        'sb:start': 'start-storybook',
        'sb:mocked': 'MOCKS=true start-storybook',
        'sb:build': 'build-storybook',
      })
    ).toEqual({
      custom: {
        'sb:start': 'start-storybook',
        'sb:mocked': 'MOCKS=true start-storybook',
        'sb:build': 'build-storybook',
      },
      official: {},
    });
  });
});

describe('sb scripts fix', () => {
  describe('sb < 7.0', () => {
    describe('does nothing', () => {
      const packageJson = { dependencies: { '@storybook/react': '^6.2.0' } };
      it('should no-op', async () => {
        await expect(
          checkSbScripts({
            packageJson,
          })
        ).resolves.toBeFalsy();
      });
    });
  });
  describe('sb >= 7.0', () => {
    describe('with old scripts', () => {
      const packageJson = {
        dependencies: {
          '@storybook/react': '^7.0.0-alpha.0',
        },
        scripts: {
          storybook: 'start-storybook -p 6006',
          'build-storybook': 'build-storybook -o build/storybook',
        },
      };
      it('should update scripts to new format', async () => {
        await expect(
          checkSbScripts({
            packageJson,
          })
        ).resolves.toEqual(
          expect.objectContaining({
            storybookScripts: {
              official: {
                storybook: 'storybook dev -p 6006',
                'build-storybook': 'storybook build -o build/storybook',
              },
              custom: {},
            },
            storybookVersion: '^7.0.0-alpha.0',
          })
        );
      });
    });

    describe('with old custom scripts', () => {
      const packageJson = {
        dependencies: {
          '@storybook/react': '^7.0.0-alpha.0',
        },
        scripts: {
          'sb:start': 'start-storybook -p 6006',
          'sb:mocked': 'MOCKS=true sb:start',
          'sb:start-ci': 'sb:start --ci',
          'sb:build': 'build-storybook -o buid/storybook',
          'sb:build-mocked': 'MOCKS=true sb:build',
          'test-storybook:ci':
            'concurrently -k -s first -n "SB,TEST" -c "magenta,blue" "yarn build-storybook --quiet && npx http-server storybook-static --port 6006 --silent" "wait-on tcp:6006 && yarn test-storybook"',
        },
      };

      it('should update scripts to new format', async () => {
        await expect(
          checkSbScripts({
            packageJson,
          })
        ).resolves.toEqual(
          expect.objectContaining({
            storybookScripts: {
              custom: {
                'sb:start': 'start-storybook -p 6006',
                'sb:build': 'build-storybook -o buid/storybook',
                'test-storybook:ci':
                  'concurrently -k -s first -n "SB,TEST" -c "magenta,blue" "yarn build-storybook --quiet && npx http-server storybook-static --port 6006 --silent" "wait-on tcp:6006 && yarn test-storybook"',
              },
              official: {},
            },
            storybookVersion: '^7.0.0-alpha.0',
          })
        );
      });

      describe('with old official and custom scripts', () => {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const packageJson = {
          dependencies: {
            '@storybook/react': '^7.0.0-alpha.0',
          },
          scripts: {
            storybook: 'start-storybook -p 6006',
            'storybook:mocked': 'MOCKS=true storybook',
            'storybook:ci': 'yarn storybook --ci',
            'storybook:build': 'build-storybook -o buid/storybook',
            'storybook:build-mocked': 'MOCKS=true yarn storybook:build',
            'test-storybook:ci':
              'concurrently -k -s first -n "SB,TEST" -c "magenta,blue" "yarn build-storybook --quiet && npx http-server storybook-static --port 6006 --silent" "wait-on tcp:6006 && yarn test-storybook"',
          },
        };
        it('should update scripts to new format', async () => {
          await expect(
            checkSbScripts({
              packageJson,
            })
          ).resolves.toEqual(
            expect.objectContaining({
              storybookScripts: {
                custom: {
                  'storybook:build': 'build-storybook -o buid/storybook',
                  'test-storybook:ci':
                    'concurrently -k -s first -n "SB,TEST" -c "magenta,blue" "yarn build-storybook --quiet && npx http-server storybook-static --port 6006 --silent" "wait-on tcp:6006 && yarn test-storybook"',
                },
                official: {
                  storybook: 'storybook dev -p 6006',
                },
              },
              storybookVersion: '^7.0.0-alpha.0',
            })
          );
        });
      });

      describe('with storybook lib installed', () => {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const packageJson = {
          dependencies: {
            '@storybook/react': '^7.0.0-alpha.0',
            storybook: '^7.0.0-alpha.0',
          },
        };
        it('should no-op', async () => {
          await expect(
            checkSbScripts({
              packageJson,
            })
          ).resolves.toBeFalsy();
        });
      });

      describe('already containing new scripts', () => {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const packageJson = {
          dependencies: {
            '@storybook/react': '^7.0.0-alpha.0',
            storybook: '^7.0.0-alpha.0',
          },
          scripts: {
            storybook: 'npx sb dev -p 6006',
            'build-storybook': 'npx sb build -o build/storybook',
          },
        };
        it('should no-op', async () => {
          await expect(
            checkSbScripts({
              packageJson,
            })
          ).resolves.toBeFalsy();
        });
      });
    });
  });
});
