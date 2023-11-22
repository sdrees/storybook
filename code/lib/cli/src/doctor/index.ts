import chalk from 'chalk';
import boxen from 'boxen';
import { createWriteStream, move, remove } from 'fs-extra';
import tempy from 'tempy';
import dedent from 'ts-dedent';
import { join } from 'path';

import { JsPackageManagerFactory } from '../js-package-manager';
import type { PackageManagerName } from '../js-package-manager';
import { getStorybookData } from '../automigrate/helpers/mainConfigFile';
import { cleanLog } from '../automigrate/helpers/cleanLog';
import { incompatibleAddons } from '../automigrate/fixes/incompatible-addons';
import { getDuplicatedDepsWarnings } from './getDuplicatedDepsWarnings';
import { getIncompatibleAddons } from './getIncompatibleAddons';
import { getMismatchingVersionsWarnings } from './getMismatchingVersionsWarning';

const logger = console;
const LOG_FILE_NAME = 'doctor-storybook.log';
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

type DoctorOptions = {
  configDir?: string;
  packageManager?: PackageManagerName;
};

export const doctor = async ({
  configDir: userSpecifiedConfigDir,
  packageManager: pkgMgr,
}: DoctorOptions = {}) => {
  augmentLogsToFile();
  const diagnosticMessages: string[] = [];

  logger.info('🩺 checking the health of your Storybook..');

  const packageManager = JsPackageManagerFactory.getPackageManager({ force: pkgMgr });
  let storybookVersion;
  let mainConfig;

  try {
    const storybookData = await getStorybookData({
      configDir: userSpecifiedConfigDir,
      packageManager,
    });
    storybookVersion = storybookData.storybookVersion;
    mainConfig = storybookData.mainConfig;
  } catch (err) {
    if (err.message.includes('No configuration files have been found')) {
      logger.info(
        dedent`[Storybook doctor] Could not find or evaluate your Storybook main.js config directory at ${chalk.blue(
          userSpecifiedConfigDir || '.storybook'
        )} so the doctor command cannot proceed. You might be running this command in a monorepo or a non-standard project structure. If that is the case, please rerun this command by specifying the path to your Storybook config directory via the --config-dir option.`
      );
    }
    logger.info(dedent`[Storybook doctor] ❌ ${err.message}`);
    logger.info('Please fix the error and try again.');
  }

  if (!storybookVersion) {
    logger.info(dedent`
      [Storybook doctor] ❌ Unable to determine Storybook version so the command will not proceed.
      🤔 Are you running storybook doctor from your project directory? Please specify your Storybook config directory with the --config-dir flag.
      `);
    process.exit(1);
  }

  const incompatibleAddonList = await getIncompatibleAddons(mainConfig);
  if (incompatibleAddonList.length > 0) {
    diagnosticMessages.push(incompatibleAddons.prompt({ incompatibleAddonList }));
  }

  const installationMetadata = await packageManager.findInstallations([
    '@storybook/*',
    'storybook',
  ]);

  const allDependencies = await packageManager.getAllDependencies();
  const mismatchingVersionMessage = getMismatchingVersionsWarnings(
    installationMetadata,
    allDependencies
  );
  if (mismatchingVersionMessage) {
    diagnosticMessages.push(mismatchingVersionMessage);
  } else {
    diagnosticMessages.push(getDuplicatedDepsWarnings(installationMetadata)?.join('\n'));
  }
  logger.info();

  const finalMessages = diagnosticMessages.filter(Boolean);

  if (finalMessages.length > 0) {
    finalMessages.push(`You can find the full logs in ${chalk.cyan(LOG_FILE_PATH)}`);

    logger.info(
      boxen(finalMessages.join('\n\n-------\n\n'), {
        borderStyle: 'round',
        padding: 1,
        title: 'Diagnostics',
        borderColor: 'red',
      })
    );
    await move(TEMP_LOG_FILE_PATH, join(process.cwd(), LOG_FILE_NAME), { overwrite: true });
  } else {
    logger.info('🥳 Your Storybook project looks good!');
    await remove(TEMP_LOG_FILE_PATH);
  }
  logger.info();

  cleanup();
};
