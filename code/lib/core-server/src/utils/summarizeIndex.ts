import type { StoryIndex } from '@storybook/types';

import { STORIES_MDX_TAG, isMdxEntry, AUTODOCS_TAG } from './StoryIndexGenerator';

export function summarizeIndex(storyIndex: StoryIndex) {
  let storyCount = 0;
  let autodocsCount = 0;
  let storiesMdxCount = 0;
  let mdxCount = 0;
  Object.values(storyIndex.entries).forEach((entry) => {
    if (entry.type === 'story') {
      storyCount += 1;
    } else if (entry.type === 'docs') {
      if (isMdxEntry(entry)) {
        mdxCount += 1;
      } else if (entry.tags.includes(STORIES_MDX_TAG)) {
        storiesMdxCount += 1;
      } else if (entry.tags.includes(AUTODOCS_TAG)) {
        autodocsCount += 1;
      }
    }
  });
  return {
    storyCount,
    autodocsCount,
    storiesMdxCount,
    mdxCount,
    version: storyIndex.v,
  };
}
