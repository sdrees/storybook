import program from 'commander';
import { join } from 'path';
import { existsSync } from 'fs';
import { command } from 'execa';
import * as tempy from 'tempy';
import { copy, remove, writeFile } from 'fs-extra';

import { getTemplatesData, renderTemplate } from './utils/template';
import { commitAllToGit } from './utils/git';

export const logger = console;

const REPROS_DIRECTORY = join(__dirname, '..', '..', 'repros');

interface PublishOptions {
  remote?: string;
  push?: boolean;
  next?: boolean;
}

const publish = async (options: PublishOptions & { tmpFolder: string }) => {
  const { next: useNextVersion, remote, push, tmpFolder } = options;

  const scriptPath = __dirname;
  const gitBranch = useNextVersion ? 'next' : 'main';

  const templatesData = await getTemplatesData(join(scriptPath, 'repro-config.yml'));

  logger.log(`👯‍♂️ Cloning the repository ${remote} in branch ${gitBranch}`);
  await command(`git clone ${remote} .`, { cwd: tmpFolder });
  await command(`git checkout ${gitBranch}`, { cwd: tmpFolder });

  logger.log(`🚚 Moving template files into the repository`);

  const templatePath = join(scriptPath, 'templates', 'root.ejs');
  const templateData = { data: templatesData, version: gitBranch };

  const output = await renderTemplate(templatePath, templateData);

  await writeFile(join(tmpFolder, 'README.md'), output);

  logger.log(`🚛 Moving all the repros into the repository`);
  await copy(join(REPROS_DIRECTORY), tmpFolder);

  await commitAllToGit(tmpFolder);

  logger.info(`
     🙌 All the examples were bootstrapped:
        - in ${tmpFolder}
        - using the '${gitBranch}' version of Storybook CLI
        - and committed on the '${gitBranch}' branch of a local Git repository

     Also all the files in the 'templates' folder were copied at the root of the Git repository.
    `);

  if (push) {
    await command(`git push --set-upstream origin ${gitBranch}`, {
      cwd: tmpFolder,
    });
    const remoteRepoUrl = `${remote.replace('.git', '')}/tree/${gitBranch}`;
    logger.info(`🚀 Everything was pushed on ${remoteRepoUrl}`);
  } else {
    logger.info(`
       To publish these examples you just need to:
          - push the branch: 'git push --set-upstream origin ${gitBranch}
      `);
  }
};

program
  .description('Create a reproduction from a set of possible templates')
  .option('--remote <remote>', 'Choose the remote to push the contents to')
  .option('--next', 'Whether to use the next version of Storybook CLI', true)
  .option('--push', 'Whether to push the contents to the remote', false)
  .option('--force-push', 'Whether to force push the changes into the repros repository', false);

program.parse(process.argv);

if (!existsSync(REPROS_DIRECTORY)) {
  throw Error("Can't find repros directory. Did you forget to run generate-repros?");
}

const tmpFolder = tempy.directory();
logger.log(`⏱ Created tmp folder: ${tmpFolder}`);

const options = program.opts() as PublishOptions;

publish({ ...options, tmpFolder }).catch(async (e) => {
  logger.error(e);

  if (existsSync(tmpFolder)) {
    logger.log('🚮 Removing the temporary folder..');
    await remove(tmpFolder);
  }
  process.exit(1);
});
