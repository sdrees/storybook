/* eslint-disable no-console */
import { join, relative } from 'path';
import { command } from 'execa';
import type { Options as ExecaOptions } from 'execa';
import pLimit from 'p-limit';
import prettyTime from 'pretty-hrtime';
import { copy, emptyDir, ensureDir, move, remove, rename, writeFile } from 'fs-extra';
import { program } from 'commander';
import { AbortController } from 'node-abort-controller';
import { directory } from 'tempy';

import reproTemplates from '../../code/lib/cli/src/repro-templates';
import storybookVersions from '../../code/lib/cli/src/versions';
import { JsPackageManagerFactory } from '../../code/lib/cli/src/js-package-manager/JsPackageManagerFactory';

import { maxConcurrentTasks } from '../utils/maxConcurrentTasks';

import { localizeYarnConfigFiles, setupYarn } from './utils/yarn';
import { GeneratorConfig } from './utils/types';
import { getStackblitzUrl, renderTemplate } from './utils/template';
import { JsPackageManager } from '../../code/lib/cli/src/js-package-manager';
import { runRegistry } from '../tasks/run-registry';

const OUTPUT_DIRECTORY = join(__dirname, '..', '..', 'repros');
const BEFORE_DIR_NAME = 'before-storybook';
const AFTER_DIR_NAME = 'after-storybook';
const SCRIPT_TIMEOUT = 5 * 60 * 1000;

const sbInit = async (cwd: string, flags?: string[]) => {
  const sbCliBinaryPath = join(__dirname, `../../code/lib/cli/bin/index.js`);
  console.log(`🎁 Installing storybook`);
  const env = { STORYBOOK_DISABLE_TELEMETRY: 'true', STORYBOOK_REPRO_GENERATOR: 'true' };
  const fullFlags = ['--yes', ...(flags || [])];
  await runCommand(`${sbCliBinaryPath} init ${fullFlags.join(' ')}`, { cwd, env });
};

const LOCAL_REGISTRY_URL = 'http://localhost:6001';
const withLocalRegistry = async (packageManager: JsPackageManager, action: () => Promise<void>) => {
  const prevUrl = packageManager.getRegistryURL();
  let error;
  try {
    console.log(`📦 Configuring local registry: ${LOCAL_REGISTRY_URL}`);
    packageManager.setRegistryURL(LOCAL_REGISTRY_URL);
    await action();
  } catch (e) {
    error = e;
  } finally {
    console.log(`📦 Restoring registry: ${prevUrl}`);
    packageManager.setRegistryURL(prevUrl);

    if (error) {
      // eslint-disable-next-line no-unsafe-finally
      throw error;
    }
  }
};

const addStorybook = async (baseDir: string, localRegistry: boolean, flags?: string[]) => {
  const beforeDir = join(baseDir, BEFORE_DIR_NAME);
  const afterDir = join(baseDir, AFTER_DIR_NAME);
  const tmpDir = join(baseDir, 'tmp');

  await ensureDir(tmpDir);
  await emptyDir(tmpDir);

  await copy(beforeDir, tmpDir);

  const packageManager = JsPackageManagerFactory.getPackageManager({}, tmpDir);
  if (localRegistry) {
    await withLocalRegistry(packageManager, async () => {
      packageManager.addPackageResolutions(storybookVersions);

      await sbInit(tmpDir, flags);
    });
  } else {
    await sbInit(tmpDir, flags);
  }
  await rename(tmpDir, afterDir);
};

export const runCommand = async (script: string, options: ExecaOptions) => {
  const shouldDebug = !!process.env.DEBUG;

  if (shouldDebug) {
    console.log(`Running command: ${script}`);
  }

  return command(script, { stdout: shouldDebug ? 'inherit' : 'ignore', shell: true, ...options });
};

const addDocumentation = async (
  baseDir: string,
  { name, dirName }: { name: string; dirName: string }
) => {
  const afterDir = join(baseDir, AFTER_DIR_NAME);
  const stackblitzConfigPath = join(__dirname, 'templates', '.stackblitzrc');
  const readmePath = join(__dirname, 'templates', 'item.ejs');

  await copy(stackblitzConfigPath, join(afterDir, '.stackblitzrc'));

  const stackblitzUrl = getStackblitzUrl(dirName);
  const contents = await renderTemplate(readmePath, {
    name,
    stackblitzUrl,
  });
  await writeFile(join(afterDir, 'README.md'), contents);
};

const runGenerators = async (
  generators: (GeneratorConfig & { dirName: string })[],
  localRegistry = true
) => {
  console.log(`🤹‍♂️ Generating repros with a concurrency of ${maxConcurrentTasks}`);

  const limit = pLimit(maxConcurrentTasks);

  let controller: AbortController;
  if (localRegistry) {
    console.log(`⚙️ Starting local registry: ${LOCAL_REGISTRY_URL}`);
    controller = await runRegistry({ debug: true });
  }

  await Promise.all(
    generators.map(({ dirName, name, script, expected }) =>
      limit(async () => {
        const flags = expected.renderer === '@storybook/html' ? ['--type html'] : [];

        const time = process.hrtime();
        console.log(`🧬 generating ${name}`);

        const baseDir = join(OUTPUT_DIRECTORY, dirName);
        const beforeDir = join(baseDir, BEFORE_DIR_NAME);
        await emptyDir(baseDir);

        // We do the creation inside a temp dir to avoid yarn container problems
        const createBaseDir = directory();
        await setupYarn({ cwd: createBaseDir });

        const createBeforeDir = join(createBaseDir, BEFORE_DIR_NAME);

        // Some tools refuse to run inside an existing directory and replace the contents,
        // where as others are very picky about what directories can be called. So we need to
        // handle different modes of operation.
        if (script.includes('{{beforeDir}}')) {
          const scriptWithBeforeDir = script.replace('{{beforeDir}}', BEFORE_DIR_NAME);
          await runCommand(scriptWithBeforeDir, { cwd: createBaseDir, timeout: SCRIPT_TIMEOUT });
        } else {
          await ensureDir(createBeforeDir);
          await runCommand(script, { cwd: createBeforeDir, timeout: SCRIPT_TIMEOUT });
        }

        await localizeYarnConfigFiles(createBaseDir, createBeforeDir);

        // Now move the created before dir into it's final location and add storybook
        await move(createBeforeDir, beforeDir);

        // Make sure there are no git projects in the folder
        await remove(join(beforeDir, '.git'));

        await addStorybook(baseDir, localRegistry, flags);

        await addDocumentation(baseDir, { name, dirName });

        console.log(
          `✅ Created ${dirName} in ./${relative(
            process.cwd(),
            baseDir
          )} successfully in ${prettyTime(process.hrtime(time))}`
        );
      })
    )
  );

  if (controller) {
    console.log(`🛑 Stopping local registry: ${LOCAL_REGISTRY_URL}`);
    controller.abort();
    console.log(`✅ Stopped`);
  }

  // FIXME: Kill dangling processes. For some reason in CI,
  // the abort signal gets executed but the child process kill
  // does not succeed?!?
  process.exit(0);
};

const generate = async ({
  template,
  localRegistry,
}: {
  template?: string;
  localRegistry?: boolean;
}) => {
  const generatorConfigs = Object.entries(reproTemplates)
    .map(([dirName, configuration]) => ({
      dirName,
      ...configuration,
    }))
    .filter(({ dirName }) => {
      if (template) {
        return dirName === template;
      }

      return true;
    });

  runGenerators(generatorConfigs, localRegistry);
};

program
  .description('Create a reproduction from a set of possible templates')
  .option('--template <template>', 'Create a single template') // change this to allow multiple templates or regex
  .option('--local-registry', 'Use local registry', false)
  .action((options) => {
    generate(options).catch((e) => {
      console.trace(e);
      process.exit(1);
    });
  })
  .parse(process.argv);
