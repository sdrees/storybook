import type { GraphQlQueryResponseData } from '@octokit/graphql';
import { graphql } from '@octokit/graphql';

export const githubGraphQlClient = graphql.defaults({
  headers: { authorization: `token ${process.env.GH_TOKEN}` },
});

export async function getLabelIds({
  repo: fullRepo,
  labelNames,
}: {
  labelNames: string[];
  repo: string;
}) {
  const query = labelNames.join('+');
  const [owner, repo] = fullRepo.split('/');
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
    { owner, repo, q: query }
  );

  const { labels } = result.repository;
  const labelToId: Record<string, string> = {};
  labels.nodes.forEach((label: { name: string; id: string }) => {
    labelToId[label.name] = label.id;
  });
  return labelToId;
}
