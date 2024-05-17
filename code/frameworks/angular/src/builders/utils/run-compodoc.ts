import { BuilderContext } from '@angular-devkit/architect';
import * as path from 'path';
import { JsPackageManagerFactory } from '@storybook/core-common';

const hasTsConfigArg = (args: string[]) => args.indexOf('-p') !== -1;
const hasOutputArg = (args: string[]) =>
  args.indexOf('-d') !== -1 || args.indexOf('--output') !== -1;

// path.relative is necessary to workaround a compodoc issue with
// absolute paths on windows machines
const toRelativePath = (pathToTsConfig: string) => {
  return path.isAbsolute(pathToTsConfig) ? path.relative('.', pathToTsConfig) : pathToTsConfig;
};

export const runCompodoc = async (
  { compodocArgs, tsconfig }: { compodocArgs: string[]; tsconfig: string },
  context: BuilderContext
): Promise<void> => {
  const tsConfigPath = toRelativePath(tsconfig);
  const finalCompodocArgs = [
    ...(hasTsConfigArg(compodocArgs) ? [] : ['-p', tsConfigPath]),
    ...(hasOutputArg(compodocArgs) ? [] : ['-d', `${context.workspaceRoot || '.'}`]),
    ...compodocArgs,
  ];

  const packageManager = JsPackageManagerFactory.getPackageManager();

  try {
    const stdout = packageManager.runPackageCommandSync(
      'compodoc',
      finalCompodocArgs,
      context.workspaceRoot,
      'inherit'
    );

    context.logger.info(stdout);
  } catch (e) {
    context.logger.error(e);
    throw e;
  }
};
