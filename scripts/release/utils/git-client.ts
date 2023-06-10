import { simpleGit } from 'simple-git';

export const git = simpleGit();

export async function getLatestTag() {
  return (await git.tags(['v*', '--sort=-v:refname', '--merged'])).latest;
}
