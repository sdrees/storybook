import type { PreparedStory } from '@storybook/types';
import { global } from '@storybook/global';

const excludeTags = Object.entries(global.TAGS_OPTIONS ?? {}).reduce(
  (acc, entry) => {
    const [tag, option] = entry;
    if ((option as any).excludeFromDocsStories) {
      acc[tag] = true;
    }
    return acc;
  },
  {} as Record<string, boolean>
);

export const parameters: any = {
  docs: {
    renderer: async () => {
      const { DocsRenderer } = (await import('./DocsRenderer')) as any;
      return new DocsRenderer();
    },
    stories: {
      filter: (story: PreparedStory) => {
        const tags = story.tags || [];
        return (
          tags.includes('autodocs') &&
          tags.filter((tag) => excludeTags[tag]).length === 0 &&
          !story.parameters.docs?.disable
        );
      },
    },
  },
};
