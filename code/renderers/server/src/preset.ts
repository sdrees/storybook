import fs from 'fs-extra';
import { toId } from '@storybook/csf';
import type { StaticMeta } from '@storybook/csf-tools';
import type { IndexerOptions, IndexedStory, StoryIndexer } from '@storybook/types';

export const storyIndexers = (indexers: StoryIndexer[] | null) => {
  const jsonIndexer = async (fileName: string, opts: IndexerOptions) => {
    const json = await fs.readJson(fileName, 'utf-8');
    const meta: StaticMeta = {
      title: json.title,
    };
    const stories: IndexedStory[] = json.stories.map((story: { name: string }) => {
      const id = toId(meta.title, story.name);
      const { name } = story;
      const indexedStory: IndexedStory = {
        id,
        name,
      };
      return indexedStory;
    });
    return {
      meta,
      stories,
    };
  };
  return [
    {
      test: /(stories|story)\.json$/,
      indexer: jsonIndexer,
    },
    ...(indexers || []),
  ];
};
