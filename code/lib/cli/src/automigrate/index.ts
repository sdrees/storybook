/* eslint-disable no-await-in-loop */
import prompts from 'prompts';
import chalk from 'chalk';
import boxen from 'boxen';
import { JsPackageManagerFactory, type PackageManagerName } from '../js-package-manager';

import type { Fix } from './fixes';
import { fixes } from './fixes';

const logger = console;

type FixId = string;

interface FixOptions {
  fixId?: FixId;
  yes?: boolean;
  dryRun?: boolean;
  useNpm?: boolean;
  force?: PackageManagerName;
}

enum FixStatus {
  CHECK_FAILED = 'check_failed',
  UNNECESSARY = 'unnecessary',
  SKIPPED = 'skipped',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

export const automigrate = async ({ fixId, dryRun, yes, useNpm, force }: FixOptions = {}) => {
  const packageManager = JsPackageManagerFactory.getPackageManager({ useNpm, force });
  const filtered = fixId ? fixes.filter((f) => f.id === fixId) : fixes;

  logger.info('🔎 checking possible migrations..');
  const fixResults = {} as Record<FixId, FixStatus>;

  for (let i = 0; i < filtered.length; i += 1) {
    const f = fixes[i] as Fix;
    let result;
    let fixStatus;
    try {
      result = await f.check({ packageManager });
    } catch (e) {
      fixStatus = FixStatus.CHECK_FAILED;
      logger.info(`failed to check fix: ${f.id}`);
    }
    if (!result) {
      fixStatus = FixStatus.UNNECESSARY;
    } else {
      logger.info(`🔎 found a '${chalk.cyan(f.id)}' migration:`);
      logger.info();
      const message = f.prompt(result);

      logger.info(
        boxen(message, { borderStyle: 'round', padding: 1, borderColor: '#F1618C' } as any)
      );

      let runAnswer: { fix: boolean };

      if (dryRun) {
        runAnswer = { fix: false };
      } else if (yes) {
        runAnswer = { fix: true };
      } else {
        runAnswer = await prompts({
          type: 'confirm',
          name: 'fix',
          message: `Do you want to run the '${chalk.cyan(f.id)}' migration on your project?`,
        });
      }

      if (runAnswer.fix) {
        try {
          await f.run({ result, packageManager, dryRun });
          logger.info(`✅ ran ${chalk.cyan(f.id)} migration`);
          fixStatus = FixStatus.SUCCEEDED;
        } catch (error) {
          fixStatus = FixStatus.FAILED;
          logger.info(`❌ error when running ${chalk.cyan(f.id)} migration:`);
          logger.info(error);
          logger.info();
        }
      } else {
        fixStatus = FixStatus.SKIPPED;
        logger.info(`Skipping the ${chalk.cyan(f.id)} migration.`);
        logger.info();
        logger.info(
          `If you change your mind, run '${chalk.cyan('npx storybook@next automigrate')}'`
        );
      }
    }

    fixResults[f.id] = fixStatus;
  }

  logger.info();
  logger.info('✅ migration check successfully ran');
  logger.info();

  return fixResults;
};
