import type { StoryIndex } from '@storybook/types';

export function summarizeIndex(storyIndex: StoryIndex) {
  let storyCount = 0;
  let autodocsCount = 0;
  let storiesMdxCount = 0;
  let mdxCount = 0;
  Object.values(storyIndex.entries).forEach((entry) => {
    if (entry.type === 'story') {
      storyCount += 1;
    } else if (entry.type === 'docs') {
      if (entry.standalone) {
        mdxCount += 1;
      } else if (entry.importPath.endsWith('.mdx')) {
        storiesMdxCount += 1;
      } else {
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
