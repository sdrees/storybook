import { listCodemods, runCodemod } from '@storybook/codemod';
import { runFixes } from './automigrate';
import { mdxToCSF } from './automigrate/fixes/mdx-to-csf';
import {
  JsPackageManagerFactory,
  getStorybookInfo,
  getCoercedStorybookVersion,
} from '@storybook/core-common';
import { getStorybookVersionSpecifier } from './helpers';

const logger = console;

export async function migrate(migration: any, { glob, dryRun, list, rename, parser }: any) {
  if (list) {
    listCodemods().forEach((key: any) => logger.log(key));
  } else if (migration) {
    if (migration === 'mdx-to-csf' && !dryRun) {
      const packageManager = JsPackageManagerFactory.getPackageManager();

      const [packageJson, storybookVersion] = await Promise.all([
        //
        packageManager.retrievePackageJson(),
        getCoercedStorybookVersion(packageManager),
      ]);
      const { configDir: inferredConfigDir, mainConfig: mainConfigPath } =
        getStorybookInfo(packageJson);
      const configDir = inferredConfigDir || '.storybook';

      // GUARDS
      if (!storybookVersion) {
        throw new Error('Could not determine Storybook version');
      }

      if (!mainConfigPath) {
        throw new Error('Could not determine main config path');
      }

      await runFixes({
        fixes: [mdxToCSF],
        configDir,
        mainConfigPath,
        packageManager,
        storybookVersion,
        beforeVersion: storybookVersion,
        isUpgrade: false,
      });
      await addStorybookBlocksPackage();
    }

    await runCodemod(migration, { glob, dryRun, logger, rename, parser });
  } else {
    throw new Error('Migrate: please specify a migration name or --list');
  }
}

export async function addStorybookBlocksPackage() {
  const packageManager = JsPackageManagerFactory.getPackageManager();
  const packageJson = await packageManager.retrievePackageJson();
  const versionToInstall = getStorybookVersionSpecifier(await packageManager.retrievePackageJson());
  logger.info(`✅ Adding "@storybook/blocks" package`);
  await packageManager.addDependencies({ installAsDevDependencies: true, packageJson }, [
    `@storybook/blocks@${versionToInstall}`,
  ]);
}
