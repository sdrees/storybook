import { readJSON, writeJSON } from 'fs-extra';
import { join } from 'path';

const logger = console;

export async function updatePackageScripts({ cwd, prefix }: { cwd: string; prefix: string }) {
  logger.info(`🔢 Adding package scripts:`);
  const packageJsonPath = join(cwd, 'package.json');
  const packageJson = await readJSON(packageJsonPath);
  packageJson.scripts = {
    ...packageJson.scripts,
    storybook: packageJson.scripts.storybook.replace(/(npx )?storybook/, `${prefix} storybook`),
    'build-storybook': packageJson.scripts['build-storybook'].replace(
      /(npx )?storybook/,
      `${prefix} storybook`
    ),

    // See comment in combine-compodoc as to why this is necessary
    ...(packageJson.scripts['docs:json'] && {
      'docs:json': 'DIR=$PWD; cd ../../scripts; yarn ts-node combine-compodoc $DIR',
    }),
  };
  await writeJSON(packageJsonPath, packageJson, { spaces: 2 });
}
