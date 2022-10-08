import path from 'path';
import { ensureDir, pathExists, remove } from 'fs-extra';
import prompts from 'prompts';
import program from 'commander';
import { readConfig, writeConfig } from '../code/lib/csf-tools';
import { getInterpretedFile } from '../code/lib/core-common';
import { serve } from './utils/serve';
// @ts-expect-error (Converted from ts-ignore)
import { filterDataForCurrentCircleCINode } from './utils/concurrency';

import * as configs from '../code/lib/cli/src/repro-generators/configs';
import { Parameters } from '../code/lib/cli/src/repro-generators/configs';
import { exec } from '../code/lib/cli/src/repro-generators/scripts';

const logger = console;

export interface Options {
  /** CLI repro template to use  */
  name: string;
  mainOverrides?: Parameters['mainOverrides'];
  /** Pre-build hook */
  ensureDir?: boolean;
  cwd?: string;
}

const siblingDir = path.join(__dirname, '..', '..', 'storybook-e2e-testing');

program
  .option('--clean', 'Clean up existing projects before running the tests', false)
  .option('--pnp', 'Run tests using Yarn 2 PnP instead of Yarn 1 + npx', false)
  .option(
    '--use-local-sb-cli',
    'Run tests using local @storybook/cli package (⚠️ Be sure @storybook/cli is properly built as it will not be rebuilt before running the tests)',
    false
  )
  .option(
    '--skip <value>',
    'Skip a framework, can be used multiple times "--skip angular@latest --skip preact"',
    (value, previous) => previous.concat([value]),
    []
  )
  .option('--docs-mode', 'Run Storybook test runner in docs mode', false)
  .option('--all', `run e2e tests for every framework`, false);
program.parse(process.argv);

type ProgramOptions = {
  all?: boolean;
  pnp?: boolean;
  useLocalSbCli?: boolean;
  clean?: boolean;
  args?: string[];
  skip?: string[];
  testRunner?: boolean;
  docsMode?: boolean;
};

const {
  all: shouldRunAllFrameworks,
  args: frameworkArgs,
  skip: frameworksToSkip,
  testRunner: shouldUseTestRunner,
  docsMode: runTestsInDocsMode,
}: ProgramOptions = program;

let { useLocalSbCli }: ProgramOptions = program;
const { pnp, clean: startWithCleanSlate }: ProgramOptions = program;

const typedConfigs: { [key: string]: Parameters } = configs;

const prepareDirectory = async ({ cwd }: Options): Promise<boolean> => {
  if (!(await pathExists(siblingDir))) {
    await ensureDir(siblingDir);
  }

  return pathExists(cwd);
};

const cleanDirectory = async ({ cwd }: Options): Promise<void> => {
  await remove(cwd);
};

const overrideMainConfig = async ({ cwd, mainOverrides }: Options) => {
  logger.info(`📝 Overwriting main.js with the following configuration:`);
  const configDir = path.join(cwd, '.storybook');
  const mainConfigPath = getInterpretedFile(path.resolve(configDir, 'main'));
  logger.debug(mainOverrides);
  const mainConfig = await readConfig(mainConfigPath);

  Object.keys(mainOverrides).forEach((field) => {
    mainConfig.setFieldValue([field], mainOverrides[field]);
  });

  await writeConfig(mainConfig);
};

const buildStorybook = async ({ cwd }: Options) => {
  await exec(
    `yarn build-storybook --quiet`,
    { cwd },
    {
      startMessage: `👷 Building Storybook`,
      errorMessage: `🚨 Storybook build failed`,
    }
  );
};

const serveStorybook = async ({ cwd }: Options, port: string) => {
  const staticDirectory = path.join(cwd, 'storybook-static');
  logger.info(`🌍 Serving ${staticDirectory} on http://localhost:${port}`);

  return serve(staticDirectory, port);
};

const runStorybookTestRunner = async (options: Options) => {
  const viewMode = runTestsInDocsMode ? 'docs' : 'story';
  await exec(
    `VIEW_MODE=${viewMode} yarn test-storybook --url http://localhost:4000`,
    { cwd: options.cwd },
    {
      startMessage: `🤖 Running Storybook tests`,
      errorMessage: `🚨 Storybook tests fails`,
    }
  );
};

const runTests = async ({ name, ...rest }: Parameters) => {
  const options = {
    name,
    ...rest,
    cwd: path.join(siblingDir, `${name}`),
  };

  logger.log();
  logger.info(`🏃️Starting for ${name}`);
  logger.log();
  logger.debug(options);
  logger.log();

  if (!(await prepareDirectory(options))) {
    let sbCLICommand = `node ${__dirname}/../code/lib/cli/bin/index.js repro`;

    if (useLocalSbCli) {
      sbCLICommand += ' --local';
    }

    const targetFolder = path.join(siblingDir, `${name}`);
    const commandArgs = [
      targetFolder,
      `--renderer ${options.renderer}`,
      `--template ${options.name}`,
      `--registry http://localhost:6001`,
      '--e2e',
    ];

    if (pnp) {
      commandArgs.push('--pnp');
    }

    const command = `${sbCLICommand} ${commandArgs.join(' ')}`;

    await exec(
      command,
      { cwd: siblingDir },
      {
        startMessage: `👷 Bootstrapping ${options.renderer} project`,
        errorMessage: `🚨 Unable to bootstrap project`,
      }
    );

    if (options.mainOverrides) {
      await overrideMainConfig(options);
    }

    await buildStorybook(options);
    logger.log();
  }

  const server = await serveStorybook(options, '4000');
  logger.log();

  try {
    await runStorybookTestRunner(options);

    logger.info(`🎉 Storybook is working great with ${name}!`);
  } catch (e) {
    logger.info(`🥺 Storybook has some issues with ${name}!`);
    throw e;
  } finally {
    server.close();
  }
};

async function postE2ECleanup(cwd: string, parameters: Parameters) {
  if (!process.env.CI) {
    const { cleanup } = await prompts({
      type: 'toggle',
      name: 'cleanup',
      message: 'Should perform cleanup?',
      initial: false,
      active: 'yes',
      inactive: 'no',
    });

    if (cleanup) {
      logger.log();
      logger.info(`🗑 Cleaning ${cwd}`);
      await cleanDirectory({ ...parameters, cwd });
    } else {
      logger.log();
      logger.info(`🚯 No cleanup happened: ${cwd}`);
    }
  }
}

async function preE2ECleanup(name: string, parameters: Parameters, cwd: string) {
  if (startWithCleanSlate) {
    logger.log();
    logger.info(`♻️  Starting with a clean slate, removing existing ${name} folder`);
    await cleanDirectory({ ...parameters, cwd });
  }
}

/**
 * Execute E2E for input parameters and return true is everything is ok, false
 * otherwise.
 * @param parameters
 */
const runE2E = async (parameters: Parameters): Promise<boolean> => {
  const { name } = parameters;
  const cwd = path.join(siblingDir, `${name}`);
  return preE2ECleanup(name, parameters, cwd)
    .then(() => runTests(parameters))
    .then(() => postE2ECleanup(cwd, parameters))
    .then(() => true)
    .catch((e) => {
      logger.error(`🛑 an error occurred:`);
      logger.error(e);
      logger.log();
      process.exitCode = 1;
      return false;
    });
};

const getConfig = async (): Promise<Parameters[]> => {
  let e2eConfigsToRun = Object.values(typedConfigs);

  if (shouldRunAllFrameworks) {
    // Nothing to do here
  } else if (frameworkArgs.length > 0) {
    e2eConfigsToRun = e2eConfigsToRun.filter((config) => frameworkArgs.includes(config.name));
  } else if (!process.env.CI) {
    const selectedValues = await prompts([
      {
        type: 'toggle',
        name: 'useLocalSbCli',
        message: 'Use local Storybook CLI',
        initial: false,
        active: 'yes',
        inactive: 'no',
      },
      {
        type: 'autocompleteMultiselect',
        message: 'Select the frameworks to run',
        name: 'frameworks',
        min: 1,
        hint: 'You can also run directly with package name like `test:e2e-framework react`, or `yarn test:e2e-framework --all` for all packages!',
        choices: Object.keys(configs).map((key) => {
          // @ts-expect-error (Converted from ts-ignore)
          const { name, version } = configs[key];
          return {
            // @ts-expect-error (Converted from ts-ignore)
            value: configs[key],
            title: `${name}@${version}`,
            selected: false,
          };
        }),
      },
    ]);

    if (!selectedValues.frameworks) {
      logger.info(`No framework was selected.`);
      process.exit(process.exitCode || 0);
    }

    useLocalSbCli = selectedValues.useLocalSbCli;
    e2eConfigsToRun = selectedValues.frameworks;
  }

  // Remove frameworks listed with `--skip` arg
  e2eConfigsToRun = e2eConfigsToRun.filter((config) => !frameworksToSkip.includes(config.name));

  return e2eConfigsToRun;
};

const perform = async (): Promise<Record<string, boolean>> => {
  const narrowedConfigs: Parameters[] = await getConfig();

  const list = filterDataForCurrentCircleCINode(narrowedConfigs) as Parameters[];

  logger.info(`📑 Will run E2E tests for:${list.map((c) => `${c.name}`).join(', ')}`);

  const e2eResult: Record<string, boolean> = {};

  // Run all e2e tests one after another and fill result map
  await list.reduce(
    (previousValue, config) =>
      previousValue
        .then(() => runE2E(config))
        .then((result) => {
          e2eResult[config.name] = result;
        }),
    Promise.resolve()
  );

  return e2eResult;
};

perform().then((e2eResult) => {
  logger.info(`🧮 E2E Results`);

  Object.entries(e2eResult).forEach(([configName, result]) => {
    logger.info(`${configName}: ${result ? 'OK' : 'KO'}`);
  });

  process.exit(process.exitCode || 0);
});
