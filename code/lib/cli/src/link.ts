import fse from 'fs-extra';
import path from 'path';
import { sync as spawnSync } from 'cross-spawn';
import { logger } from '@storybook/node-logger';
import { exec } from './repro-generators/scripts';

interface LinkOptions {
  target: string;
  local?: boolean;
  start: boolean;
}

export const link = async ({ target, local, start }: LinkOptions) => {
  const storybookDir = process.cwd();
  try {
    const packageJson = await fse.readJSON('package.json');
    if (packageJson.name !== '@storybook/root') {
      throw new Error();
    }
  } catch {
    throw new Error('Expected to run link from the root of the storybook monorepo');
  }

  let reproDir = target;
  let reproName = path.basename(target);

  if (!local) {
    const reprosDir = path.join(storybookDir, '../storybook-repros');
    logger.info(`Ensuring directory ${reprosDir}`);
    await fse.ensureDir(reprosDir);

    logger.info(`Cloning ${target}`);
    await exec(`git clone ${target}`, { cwd: reprosDir });
    // Extract a repro name from url given as input (take the last part of the path and remove the extension)
    reproName = path.basename(target, path.extname(target));
    reproDir = path.join(reprosDir, reproName);
  }

  const reproPackageJson = await fse.readJSON(path.join(reproDir, 'package.json'));

  const version = spawnSync('yarn', ['--version'], {
    cwd: reproDir,
    stdio: 'pipe',
    shell: true,
  }).stdout.toString();

  if (!/^[23]\./.test(version)) {
    logger.warn(`🚨 Expected yarn 2 or 3 in ${reproDir}!`);
    logger.warn('');
    logger.warn('Please set it up with `yarn set version berry`,');
    logger.warn(`then link '${reproDir}' with the '--local' flag.`);
    return;
  }

  logger.info(`Linking ${reproDir}`);
  await exec(`yarn link --all ${storybookDir}`, { cwd: reproDir });

  logger.info(`Installing ${reproName}`);
  await exec(`yarn install`, { cwd: reproDir });

  // ⚠️ TODO: Fix peer deps in `@storybook/preset-create-react-app`
  logger.info(
    `Magic stuff related to @storybook/preset-create-react-app, we need to fix peerDependencies`
  );

  if (!reproPackageJson.devDependencies.vite) {
    await exec(`yarn add -D webpack-hot-middleware`, { cwd: reproDir });
  }

  // ensure that linking is possible
  await exec(`yarn add @types/node@16`, { cwd: reproDir });

  if (start) {
    logger.info(`Running ${reproName} storybook`);
    await exec(`yarn run storybook`, { cwd: reproDir });
  }
};
