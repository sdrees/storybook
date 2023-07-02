import program from 'commander';
import { v4 as uuidv4 } from 'uuid';
import ora from 'ora';
import { getLabelIds, githubGraphQlClient } from './utils/github-client';
import { getPullInfoFromCommits, getRepo } from './utils/get-changes';
import { getLatestTag, git } from './utils/git-client';

program
  .name('label-patches')
  .description('Label all patches applied in current branch up to the latest release tag.');

async function labelPR(id: string, labelId: string) {
  await githubGraphQlClient(
    `
      mutation ($input: AddLabelsToLabelableInput!) {
        addLabelsToLabelable(input: $input) {
          clientMutationId
        }
      }
    `,
    { input: { labelIds: [labelId], labelableId: id, clientMutationId: uuidv4() } }
  );
}

export const run = async (_: unknown) => {
  if (!process.env.GH_TOKEN) {
    throw new Error('GH_TOKEN environment variable must be set, exiting.');
  }

  const spinner = ora('Looking for latest tag').start();
  const latestTag = await getLatestTag();
  spinner.succeed(`Found latest tag: ${latestTag}`);

  const spinner2 = ora(`Looking at cherry pick commits since ${latestTag}`).start();
  const commitsSinceLatest = await git.log({ from: latestTag });
  console.log(commitsSinceLatest);
  const cherryPicked = commitsSinceLatest.all.flatMap((it) => {
    const result = it.body.match(/\(cherry picked from commit (\b[0-9a-f]{7,40}\b)\)/);
    return result ? [result?.[1]] : [];
  });

  if (cherryPicked.length === 0) {
    spinner2.fail('No cherry pick commits found to label.');
    return;
  }

  const repo = await getRepo();
  const pullRequests = (
    await getPullInfoFromCommits({
      repo,
      commits: cherryPicked.map((hash) => ({ hash })),
    })
  ).filter((it) => it.id != null);

  if (pullRequests.length === 0) {
    spinner2.fail(
      `Found picks: ${cherryPicked.join(', ')}, but no associated pull request found to label.`
    );
    return;
  }

  const commitWithPr = pullRequests.map((pr) => `Commit: ${pr.commit}\n PR: ${pr.links.pull}`);

  spinner2.succeed(`Found the following picks 🍒:\n ${commitWithPr.join('\n')}`);

  const spinner3 = ora(`Labeling the PRs with the picked label...`).start();
  try {
    const labelToId = await getLabelIds({ repo, labelNames: ['picked'] });
    await Promise.all(pullRequests.map((pr) => labelPR(pr.id, labelToId.picked)));
    spinner3.succeed(`Successfully labeled all PRs with the picked label.`);
  } catch (e) {
    spinner3.fail(`Something went wrong when labelling the PRs.`);
    console.error(e);
  }
};

if (require.main === module) {
  const options = program.parse(process.argv);
  run(options).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
