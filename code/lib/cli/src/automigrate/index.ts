/* eslint-disable no-await-in-loop */
import prompts from 'prompts';
import chalk from 'chalk';
import boxen from 'boxen';
import dedent from 'ts-dedent';
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

export const automigrate = async ({ fixId, dryRun, yes, useNpm, force }: FixOptions = {}) => {
  const packageManager = JsPackageManagerFactory.getPackageManager({ useNpm, force });
  const filtered = fixId ? fixes.filter((f) => f.id === fixId) : fixes;

  logger.info('🔎 checking possible migrations..');
  const fixResults = {} as Record<FixId, FixStatus>;
  const fixSummary: FixSummary = { succeeded: [], failed: {}, manual: [], skipped: [] };

  for (let i = 0; i < filtered.length; i += 1) {
    const f = fixes[i] as Fix;
    let result;

    try {
      result = await f.check({ packageManager });
    } catch (error) {
      logger.info(`⚠️  failed to check fix ${chalk.bold(f.id)}`);
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
            await f.run({ result, packageManager, dryRun });
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
      fixResults[f.id] ||= FixStatus.UNNECESSARY;
    }
  }

  logger.info();
  logger.info(getMigrationSummary(fixResults, fixSummary));
  logger.info();

  return fixResults;
};

function getMigrationSummary(fixResults: Record<string, FixStatus>, fixSummary: FixSummary) {
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
    `
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
