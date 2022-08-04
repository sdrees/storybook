import shell, { ExecOptions } from 'shelljs';
import chalk from 'chalk';

const logger = console;

export const exec = async (
  command: string,
  options: ExecOptions = {},
  {
    startMessage,
    errorMessage,
    dryRun,
  }: { startMessage?: string; errorMessage?: string; dryRun?: boolean } = {}
) => {
  if (startMessage) logger.info(startMessage);

  if (dryRun) {
    logger.info(`\n> ${command}\n`);
    return undefined;
  }

  logger.debug(command);
  return new Promise((resolve, reject) => {
    const defaultOptions: ExecOptions = {
      silent: false,
    };
    const child = shell.exec(command, {
      ...defaultOptions,
      ...options,
      async: true,
      silent: false,
    });

    child.stderr.pipe(process.stderr);

    child.on('exit', (code) => {
      if (code === 0) {
        resolve(undefined);
      } else {
        logger.error(chalk.red(`An error occurred while executing: \`${command}\``));
        logger.log(errorMessage);
        reject(new Error(`command exited with code: ${code}: `));
      }
    });
  });
};
