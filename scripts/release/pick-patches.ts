/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
import program from 'commander';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';
import type { GraphQlQueryResponseData } from '@octokit/graphql';
import ora from 'ora';
import { simpleGit } from 'simple-git';
import { setOutput } from '@actions/core';
import { getUnpickedPRs } from './utils/get-unpicked-prs';
import { githubGraphQlClient } from './utils/github-client';

program.name('pick-patches').description('Cherry pick patch PRs back to main');

const logger = console;

const OWNER = 'storybookjs';
const REPO = 'storybook';
const SOURCE_BRANCH = 'next';

const git = simpleGit();

interface PR {
  number: number;
  id: string;
  branch: string;
  title: string;
  mergeCommit: string;
}

const LABEL = {
  PATCH: 'patch',
  PICKED: 'picked',
  DOCUMENTATION: 'documentation',
} as const;

function formatPR(pr: PR): string {
  return `https://github.com/${OWNER}/${REPO}/pull/${pr.number} "${pr.title}" ${chalk.yellow(
    pr.mergeCommit
  )}`;
}

// @ts-expect-error not used atm
async function getLabelIds(labelNames: string[]) {
  const query = labelNames.join('+');
  const result = await githubGraphQlClient<GraphQlQueryResponseData>(
    `
      query ($owner: String!, $repo: String!, $q: String!) {
        repository(owner: $owner, name: $repo) {
          labels(query: $q, first: 10) {
            nodes {
              id
              name
              description
            }
          }
        }
      }
    `,
    {
      owner: OWNER,
      repo: REPO,
      q: query,
    }
  );

  const { labels } = result.repository;
  const labelToId = {} as Record<string, string>;
  labels.nodes.forEach((label: { name: string; id: string }) => {
    labelToId[label.name] = label.id;
  });
  return labelToId;
}

// @ts-expect-error not used atm
async function labelPR(id: string, labelToId: Record<string, string>) {
  await githubGraphQlClient(
    `
      mutation ($input: AddLabelsToLabelableInput!) {
        addLabelsToLabelable(input: $input) {
          clientMutationId
        }
      }
    `,
    {
      input: {
        labelIds: [labelToId[LABEL.PICKED]],
        labelableId: id,
        clientMutationId: uuidv4(),
      },
    }
  );
}

export const run = async (_: unknown) => {
  if (!process.env.GH_TOKEN) {
    logger.error('GH_TOKEN environment variable must be set, exiting.');
    process.exit(1);
  }

  const sourceBranch = SOURCE_BRANCH;

  const spinner = ora('Searching for patch PRs to cherry-pick').start();

  // const labelToId = await getLabelIds(Object.values(LABEL));
  const patchPRs = await getUnpickedPRs(sourceBranch);

  if (patchPRs.length > 0) {
    spinner.succeed(`Found ${patchPRs.length} PRs to cherry-pick to main.`);
  } else {
    spinner.warn('No PRs found.');
  }

  const failedCherryPicks: string[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const pr of patchPRs) {
    const prSpinner = ora(`Cherry picking #${pr.number}`).start();

    try {
      await git.raw(['cherry-pick', '-m', '1', '--keep-redundant-commits', '-x', pr.mergeCommit]);
      prSpinner.succeed(`Picked: ${formatPR(pr)}`);
    } catch (pickError) {
      prSpinner.fail(`Failed to automatically pick: ${formatPR(pr)}`);
      logger.error(pickError.message);
      const abort = ora(`Aborting cherry pick for merge commit: ${pr.mergeCommit}`).start();
      try {
        await git.raw(['cherry-pick', '--abort']);
        abort.stop();
      } catch (abortError) {
        abort.warn(`Failed to abort cherry pick (${pr.mergeCommit})`);
        logger.error(pickError.message);
      }
      failedCherryPicks.push(pr.mergeCommit);
      prSpinner.info(
        `This PR can be picked manually with: ${chalk.grey(
          `git cherry-pick -m1 -x ${pr.mergeCommit}`
        )}`
      );
    }
  }

  if (process.env.GITHUB_ACTIONS === 'true') {
    setOutput('failed-cherry-picks', JSON.stringify(failedCherryPicks));
  }
};

if (require.main === module) {
  const options = program.parse(process.argv);
  run(options).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
