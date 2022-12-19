import { writeFile, pathExists } from 'fs-extra';
import { logger } from '@storybook/node-logger';
import path from 'path';
import prompts from 'prompts';
import { JsPackageManagerFactory } from './js-package-manager';

export const generateStorybookBabelConfigInCWD = async () => {
  const target = process.cwd();
  return generateStorybookBabelConfig({ target });
};
export const generateStorybookBabelConfig = async ({ target }: { target: string }) => {
  logger.info(`Generating the storybook default babel config at ${target}`);

  const fileName = '.babelrc.json';
  const location = path.join(target, fileName);

  const exists = await pathExists(location);

  if (exists) {
    const { overwrite } = await prompts({
      type: 'confirm',
      initial: true,
      name: 'overwrite',
      message: `${fileName} already exists. Would you like overwrite it?`,
    });

    if (overwrite === false) {
      logger.warn(`Cancelled, babel config file was NOT written to file-system.`);
      return;
    }
  }

  const { typescript, jsx } = await prompts([
    {
      type: 'confirm',
      initial: true,
      name: 'typescript',
      message: `Do you want to add the TypeScript preset?`,
    },
    {
      type: 'confirm',
      initial: true,
      name: 'jsx',
      message: `Do you want to add the React preset?`,
    },
  ]);

  const added = ['@babel/preset-env'];
  const presets: (string | [string, any])[] = [['@babel/preset-env', { targets: { chrome: 100 } }]];

  if (typescript) {
    added.push('@babel/preset-typescript');
    presets.push('@babel/preset-typescript');
  }

  if (jsx) {
    added.push('@babel/preset-react');
    presets.push('@babel/preset-react');
  }

  const contents = JSON.stringify(
    {
      sourceType: 'unambiguous',
      presets,
      plugins: [],
    },
    null,
    2
  );

  logger.info(`Writing file to ${location}`);
  await writeFile(location, contents);

  const { runInstall } = await prompts({
    type: 'confirm',
    initial: true,
    name: 'runInstall',
    message: `Shall we install the required dependencies now? (${added.join(', ')})`,
  });

  if (runInstall) {
    logger.info(`Installing dependencies...`);

    const packageManager = JsPackageManagerFactory.getPackageManager();

    packageManager.addDependencies({ installAsDevDependencies: true }, added);
  }
};
