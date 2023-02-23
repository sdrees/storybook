import type { PackageJson } from '../../js-package-manager';
import { makePackageManager } from '../helpers/testing-helpers';
import { sbBinary } from './sb-binary';

const checkStorybookBinary = async ({
  packageJson,
  storybookVersion = '7.0.0',
}: {
  packageJson: PackageJson;
  storybookVersion?: string;
}) => {
  return sbBinary.check({ packageManager: makePackageManager(packageJson) });
};

describe('storybook-binary fix', () => {
  describe('sb < 7.0', () => {
    describe('does nothing', () => {
      const packageJson = { dependencies: { '@storybook/react': '^6.2.0' } };
      it('should no-op', async () => {
        await expect(
          checkStorybookBinary({
            packageJson,
            storybookVersion: '6.2.0',
          })
        ).resolves.toBeFalsy();
      });
    });
  });

  describe('sb >= 7.0', () => {
    it('should no-op in NX projects', async () => {
      const packageJson = {
        dependencies: { '@storybook/react': '^7.0.0', '@nrwl/storybook': '^15.7.1' },
      };
      await expect(
        checkStorybookBinary({
          packageJson,
        })
      ).resolves.toBeFalsy();
    });

    it('should add storybook dependency if not present', async () => {
      const packageJson = {
        dependencies: {
          '@storybook/react': '^7.0.0-alpha.0',
        },
      };
      await expect(
        checkStorybookBinary({
          packageJson,
        })
      ).resolves.toEqual(
        expect.objectContaining({
          hasSbBinary: false,
          hasStorybookBinary: false,
        })
      );
    });

    it('should remove sb dependency if it is present', async () => {
      const packageJson = {
        dependencies: {
          '@storybook/react': '^7.0.0-alpha.0',
          sb: '6.5.0',
        },
      };
      await expect(
        checkStorybookBinary({
          packageJson,
        })
      ).resolves.toEqual(
        expect.objectContaining({
          hasSbBinary: true,
          hasStorybookBinary: false,
        })
      );
    });

    it('should no op if storybook is present and sb is not present', async () => {
      const packageJson = {
        dependencies: {
          '@storybook/react': '^7.0.0-alpha.0',
          storybook: '^7.0.0-alpha.0',
        },
      };
      await expect(
        checkStorybookBinary({
          packageJson,
        })
      ).resolves.toBeNull();
    });
  });
});
