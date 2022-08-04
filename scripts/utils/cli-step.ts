import { getCommand, OptionSpecifier, OptionValues } from './options';
import { exec } from './exec';

const cliExecutable = require.resolve('../../code/lib/cli/bin/index.js');

export type CLIStep<TOptions extends OptionSpecifier> = {
  command: string;
  description: string;
  hasArgument?: boolean;
  icon: string;
  // It would be kind of great to be able to share these with `lib/cli/src/generate.ts`
  options: TOptions;
};

export async function executeCLIStep<TOptions extends OptionSpecifier>(
  cliStep: CLIStep<TOptions>,
  options: {
    argument?: string;
    optionValues?: Partial<OptionValues<TOptions>>;
    cwd: string;
    dryRun?: boolean;
  }
) {
  if (cliStep.hasArgument && !options.argument)
    throw new Error(`Argument required for ${cliStep.command} command.`);

  const prefix = `node ${cliExecutable} ${cliStep.command}`;
  const command = getCommand(
    cliStep.hasArgument ? `${prefix} ${options.argument}` : prefix,
    cliStep.options,
    options.optionValues || {}
  );

  await exec(
    command,
    { cwd: options.cwd },
    {
      startMessage: `${cliStep.icon} ${cliStep.description}`,
      errorMessage: `🚨 ${cliStep.description} failed`,
      dryRun: options.dryRun,
    }
  );
}
