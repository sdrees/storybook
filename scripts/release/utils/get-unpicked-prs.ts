/* eslint-disable no-console */
import type { GraphQlQueryResponseData } from '@octokit/graphql';
import { githubGraphQlClient } from './github-client';

export interface PR {
  number: number;
  id: string;
  branch: string;
  title: string;
  mergeCommit: string;
}

export async function getUnpickedPRs(baseBranch: string, verbose?: boolean): Promise<Array<PR>> {
  console.log(`💬 Getting unpicked patch pull requests...`);
  const result = await githubGraphQlClient<GraphQlQueryResponseData>(
    `
      query ($owner: String!, $repo: String!, $state: PullRequestState!, $order: IssueOrder!) {
        repository(owner: $owner, name: $repo) {
          pullRequests(states: [$state], labels: ["patch"], orderBy: $order, first: 50) {
            nodes {
              id
              number
              title
              baseRefName
              mergeCommit { 
                abbreviatedOid
              }
              labels(first: 20) {
                nodes {
                  name
                }
              }
            }
          }
        }
      }
    `,
    {
      owner: 'storybookjs',
      repo: 'storybook',
      order: {
        field: 'UPDATED_AT',
        direction: 'ASC',
      },
      state: 'MERGED',
    }
  );

  const {
    pullRequests: { nodes },
  } = result.repository;

  const prs = nodes.map((node: any) => ({
    number: node.number,
    id: node.id,
    branch: node.baseRefName,
    title: node.title,
    mergeCommit: node.mergeCommit.abbreviatedOid,
    labels: node.labels.nodes.map((l: any) => l.name),
  }));

  const unpickedPRs = prs
    .filter((pr: any) => !pr.labels.includes('picked'))
    .filter((pr: any) => pr.branch === baseBranch);
  if (verbose) {
    console.log(`🔍 Found unpicked patch pull requests:
  ${JSON.stringify(unpickedPRs, null, 2)}`);
  }
  return unpickedPRs;
}
