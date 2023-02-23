/* eslint-disable no-await-in-loop */
import prompts from 'prompts';
import chalk from 'chalk';
import boxen from 'boxen';
import { createWriteStream, move, remove } from 'fs-extra';
import tempy from 'tempy';
import dedent from 'ts-dedent';

import { join } from 'path';
import { getStorybookInfo, loadMainConfig } from '@storybook/core-common';
import semver from 'semver';
import {
  JsPackageManagerFactory,
  useNpmWarning,
  type PackageManagerName,
} from '../js-package-manager';

import type { Fix } from './fixes';
import { allFixes } from './fixes';
import { cleanLog } from './helpers/cleanLog';

const logger = console;
const LOG_FILE_NAME = 'migration-storybook.log';
const LOG_FILE_PATH = join(process.cwd(), LOG_FILE_NAME);
let TEMP_LOG_FILE_PATH = '';

const originalStdOutWrite = process.stdout.write.bind(process.stdout);
const originalStdErrWrite = process.stderr.write.bind(process.stdout);

const augmentLogsToFile = () => {
  TEMP_LOG_FILE_PATH = tempy.file({ name: LOG_FILE_NAME });
  const logStream = createWriteStream(TEMP_LOG_FILE_PATH);

  process.stdout.write = (d: string) => {
    originalStdOutWrite(d);
    return logStream.write(cleanLog(d));
  };
  process.stderr.write = (d: string) => {
    return logStream.write(cleanLog(d));
  };
};

const cleanup = () => {
  process.stdout.write = originalStdOutWrite;
  process.stderr.write = originalStdErrWrite;
};

type FixId = string;

interface FixOptions {
  fixId?: FixId;
  list?: boolean;
  fixes?: Fix[];
  yes?: boolean;
  dryRun?: boolean;
  useNpm?: boolean;
  packageManager?: PackageManagerName;
  configDir?: string;
  renderer?: string;
  skipInstall?: boolean;
}

enum PreCheckFailure {
  UNDETECTED_SB_VERSION = 'undetected_sb_version',
  MAINJS_NOT_FOUND = 'mainjs_not_found',
  MAINJS_EVALUATION = 'mainjs_evaluation_error',
}

enum FixStatus {
  CHECK_FAILED = 'check_failed',
  UNNECESSARY = 'unnecessary',
  MANUAL_SUCCEEDED = 'manual_succeeded',
  MANUAL_SKIPPED = 'manual_skipped',
  SKIPPED = 'skipped',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

type FixSummary = {
  skipped: FixId[];
  manual: FixId[];
  succeeded: FixId[];
  failed: Record<FixId, string>;
};

const logAvailableMigrations = () => {
  const availableFixes = allFixes.map((f) => chalk.yellow(f.id)).join(', ');
  logger.info(`\nThe following migrations are available: ${availableFixes}`);
};

export const automigrate = async ({
  fixId,
  fixes: inputFixes,
  dryRun,
  yes,
  useNpm,
  packageManager: pkgMgr,
  list,
  configDir: userSpecifiedConfigDir,
  renderer: rendererPackage,
  skipInstall,
}: FixOptions = {}) => {
  if (list) {
    logAvailableMigrations();
    return null;
  }

  if (useNpm) {
    useNpmWarning();
    // eslint-disable-next-line no-param-reassign
    pkgMgr = 'npm';
  }

  const selectedFixes = inputFixes || allFixes;
  const fixes = fixId ? selectedFixes.filter((f) => f.id === fixId) : selectedFixes;

  if (fixId && fixes.length === 0) {
    logger.info(`📭 No migrations found for ${chalk.magenta(fixId)}.`);
    logAvailableMigrations();
    return null;
  }

  augmentLogsToFile();

  const packageManager = JsPackageManagerFactory.getPackageManager({ force: pkgMgr });

  const {
    configDir: inferredConfigDir,
    mainConfig: mainConfigPath,
    version: storybookVersion,
  } = getStorybookInfo(packageManager.retrievePackageJson(), userSpecifiedConfigDir);

  const sbVersionCoerced = storybookVersion && semver.coerce(storybookVersion)?.version;
  if (!sbVersionCoerced) {
    logger.info(dedent`
      [Storybook automigrate] ❌ Unable to determine storybook version  so the automigrations will be skipped.
        🤔 Are you running automigrate from your project directory? Please specify your Storybook config directory with the --config-dir flag.
      `);
    return {
      preCheckFailure: PreCheckFailure.UNDETECTED_SB_VERSION,
    };
  }

  const configDir = userSpecifiedConfigDir || inferredConfigDir || '.storybook';
  try {
    await loadMainConfig({ configDir });
  } catch (err) {
    if (err.message.includes('No configuration files have been found')) {
      logger.info(
        dedent`[Storybook automigrate] Could not find or evaluate your Storybook main.js config directory at ${chalk.blue(
          configDir
        )} so the automigrations will be skipped. You might be running this command in a monorepo or a non-standard project structure. If that is the case, please rerun this command by specifying the path to your Storybook config directory via the --config-dir option.`
      );
      return {
        preCheckFailure: PreCheckFailure.MAINJS_NOT_FOUND,
      };
    }
    logger.info(
      dedent`[Storybook automigrate] ❌ Failed trying to evaluate ${chalk.blue(
        mainConfigPath
      )} with the following error: ${err.message}`
    );
    logger.info('Please fix the error and try again.');

    return {
      preCheckFailure: PreCheckFailure.MAINJS_EVALUATION,
    };
  }

  logger.info('🔎 checking possible migrations..');
  const fixResults = {} as Record<FixId, FixStatus>;
  const fixSummary: FixSummary = { succeeded: [], failed: {}, manual: [], skipped: [] };

  for (let i = 0; i < fixes.length; i += 1) {
    const f = fixes[i] as Fix;
    let result;

    try {
      result = await f.check({
        packageManager,
        configDir,
        rendererPackage,
      });
    } catch (error) {
      logger.info(`⚠️  failed to check fix ${chalk.bold(f.id)}`);
      logger.error(`\n${error.stack}`);
      fixSummary.failed[f.id] = error.message;
      fixResults[f.id] = FixStatus.CHECK_FAILED;
    }

    if (result) {
      logger.info(`\n🔎 found a '${chalk.cyan(f.id)}' migration:`);
      const message = f.prompt(result);

      logger.info(
        boxen(message, {
          borderStyle: 'round',
          padding: 1,
          borderColor: '#F1618C',
          title: f.promptOnly ? 'Manual migration detected' : 'Automigration detected',
        })
      );

      let runAnswer: { fix: boolean };

      try {
        if (dryRun) {
          runAnswer = { fix: false };
        } else if (yes) {
          runAnswer = { fix: true };
          if (f.promptOnly) {
            fixResults[f.id] = FixStatus.MANUAL_SUCCEEDED;
            fixSummary.manual.push(f.id);
          }
        } else if (f.promptOnly) {
          fixResults[f.id] = FixStatus.MANUAL_SUCCEEDED;
          fixSummary.manual.push(f.id);

          logger.info();
          const { shouldContinue } = await prompts(
            {
              type: 'toggle',
              name: 'shouldContinue',
              message:
                'Select continue once you have made the required changes, or quit to exit the migration process',
              initial: true,
              active: 'continue',
              inactive: 'quit',
            },
            {
              onCancel: () => {
                throw new Error();
              },
            }
          );

          if (!shouldContinue) {
            fixResults[f.id] = FixStatus.MANUAL_SKIPPED;
            break;
          }
        } else {
          runAnswer = await prompts(
            {
              type: 'confirm',
              name: 'fix',
              message: `Do you want to run the '${chalk.cyan(f.id)}' migration on your project?`,
              initial: true,
            },
            {
              onCancel: () => {
                throw new Error();
              },
            }
          );
        }
      } catch (err) {
        break;
      }

      if (!f.promptOnly) {
        if (runAnswer.fix) {
          try {
            await f.run({
              result,
              packageManager,
              dryRun,
              mainConfigPath,
              skipInstall,
            });
            logger.info(`✅ ran ${chalk.cyan(f.id)} migration`);

            fixResults[f.id] = FixStatus.SUCCEEDED;
            fixSummary.succeeded.push(f.id);
          } catch (error) {
            fixResults[f.id] = FixStatus.FAILED;
            fixSummary.failed[f.id] = error.message;

            logger.info(`❌ error when running ${chalk.cyan(f.id)} migration`);
            logger.info(error);
            logger.info();
          }
        } else {
          fixResults[f.id] = FixStatus.SKIPPED;
          fixSummary.skipped.push(f.id);
        }
      }
    } else {
      fixResults[f.id] = fixResults[f.id] || FixStatus.UNNECESSARY;
    }
  }

  const hasFailures = Object.values(fixResults).some(
    (r) => r === FixStatus.FAILED || r === FixStatus.CHECK_FAILED
  );

  // if migration failed, display a log file in the users cwd
  if (hasFailures) {
    await move(TEMP_LOG_FILE_PATH, join(process.cwd(), LOG_FILE_NAME), { overwrite: true });
  } else {
    await remove(TEMP_LOG_FILE_PATH);
  }

  logger.info();
  logger.info(getMigrationSummary(fixResults, fixSummary, LOG_FILE_PATH));
  logger.info();

  cleanup();

  return fixResults;
};

function getMigrationSummary(
  fixResults: Record<string, FixStatus>,
  fixSummary: FixSummary,
  logFile?: string
) {
  const hasNoFixes = Object.values(fixResults).every((r) => r === FixStatus.UNNECESSARY);
  const hasFailures = Object.values(fixResults).some(
    (r) => r === FixStatus.FAILED || r === FixStatus.CHECK_FAILED
  );
  // eslint-disable-next-line no-nested-ternary
  const title = hasNoFixes
    ? 'No migrations were applicable to your project'
    : hasFailures
    ? 'Migration check ran with failures'
    : 'Migration check ran successfully';

  const successfulFixesMessage =
    fixSummary.succeeded.length > 0
      ? `
      ${chalk.bold('Successful migrations:')}\n\n ${fixSummary.succeeded
          .map((m) => chalk.green(m))
          .join(', ')}
    `
      : '';

  const failedFixesMessage =
    Object.keys(fixSummary.failed).length > 0
      ? `
    ${chalk.bold('Failed migrations:')}\n ${Object.entries(fixSummary.failed).reduce(
          (acc, [id, error]) => {
            return `${acc}\n${chalk.redBright(id)}:\n${error}\n`;
          },
          ''
        )}
    \nYou can find the full logs in ${chalk.cyan(logFile)}\n`
      : '';

  const manualFixesMessage =
    fixSummary.manual.length > 0
      ? `
      ${chalk.bold('Manual migrations:')}\n\n ${fixSummary.manual
          .map((m) =>
            fixResults[m] === FixStatus.MANUAL_SUCCEEDED ? chalk.green(m) : chalk.blue(m)
          )
          .join(', ')}
    `
      : '';

  const skippedFixesMessage =
    fixSummary.skipped.length > 0
      ? `
      ${chalk.bold('Skipped migrations:')}\n\n ${fixSummary.skipped
          .map((m) => chalk.cyan(m))
          .join(', ')}
    `
      : '';

  const divider = hasNoFixes ? '' : '\n─────────────────────────────────────────────────\n\n';

  const summaryMessage = dedent`
    ${successfulFixesMessage}${manualFixesMessage}${failedFixesMessage}${skippedFixesMessage}${divider}If you'd like to run the migrations again, you can do so by running '${chalk.cyan(
    'npx storybook@next automigrate'
  )}'
    
    The automigrations try to migrate common patterns in your project, but might not contain everything needed to migrate to the latest version of Storybook.
    
    Please check the changelog and migration guide for manual migrations and more information: ${chalk.yellow(
      'https://storybook.js.org/migration-guides/7.0'
    )}
    And reach out on Discord if you need help: ${chalk.yellow('https://discord.gg/storybook')}
  `;

  return boxen(summaryMessage, {
    borderStyle: 'round',
    padding: 1,
    title,
    borderColor: hasFailures ? 'red' : 'green',
  });
}
