/* eslint-disable no-await-in-loop, no-restricted-syntax */
import execa, { Options } from 'execa';
import chalk from 'chalk';

const logger = console;

type StepOptions = {
  startMessage?: string;
  errorMessage?: string;
  dryRun?: boolean;
  debug?: boolean;
};

export const exec = async (
  command: string | string[],
  options: Options = {},
  { startMessage, errorMessage, dryRun, debug }: StepOptions = {}
): Promise<void> => {
  logger.info();
  if (startMessage) logger.info(startMessage);

  if (dryRun) {
    logger.info(`\n> ${command}\n`);
    return undefined;
  }

  const defaultOptions: Options = {
    stdout: debug ? 'inherit' : 'ignore',
  };
  try {
    if (typeof command === 'string') {
      logger.debug(`> ${command}`);
      await execa.command(command, { ...defaultOptions, ...options });
    } else {
      for (const subcommand of command) {
        logger.debug(`> ${subcommand}`);
        await execa.command(subcommand, { ...defaultOptions, ...options });
      }
    }
  } catch (err) {
    logger.error(chalk.red(`An error occurred while executing: \`${command}\``));
    logger.log(errorMessage);
    throw err;
  }

  return undefined;
};
