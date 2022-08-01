import { command } from 'execa';
import { logger } from '../publish';

export async function commitAllToGit(cwd: string) {
  try {
    logger.log(`💪 Committing everything to the repository`);

    await command('git add .', { cwd });

    const currentCommitSHA = await command('git rev-parse HEAD');
    await command(
      `git commit -m "Update examples - ${new Date().toDateString()} - ${currentCommitSHA.stdout
        .toString()
        .slice(0, 12)}"`,
      {
        shell: true,
        cwd,
      }
    );
  } catch (e) {
    logger.log(
      `🤷 Git found no changes between previous versions so there is nothing to commit. Skipping publish!`
    );
  }
}
