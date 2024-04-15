import type { Options } from '@storybook/types';
import dedent from 'ts-dedent';
import { normalizeStories, normalizeStoryPath } from '@storybook/core-common';
import path from 'path';
import { storyNameFromExport, toId } from '@storybook/csf';
import { userOrAutoTitleFromSpecifier } from '@storybook/preview-api';
import { posix } from './posix';

interface StoryIdData {
  storyFilePath: string;
  exportedStoryName: string;
}

export async function getStoryId(data: StoryIdData, options: Options) {
  const stories = await options.presets.apply('stories', [], options);

  const workingDir = process.cwd();

  const normalizedStories = normalizeStories(stories, {
    configDir: options.configDir,
    workingDir,
  });

  const relativePath = path.relative(workingDir, data.storyFilePath);
  const importPath = posix(normalizeStoryPath(relativePath));

  const autoTitle = normalizedStories
    .map((normalizeStory) => userOrAutoTitleFromSpecifier(importPath, normalizeStory))
    .filter(Boolean)[0];

  if (autoTitle === undefined) {
    // eslint-disable-next-line local-rules/no-uncategorized-errors
    throw new Error(dedent`
      The generation of your new Story file was successful but it seems that we are unable to index it.
      Please make sure that the new Story file is matched by the 'stories' glob pattern in your Storybook configuration.
      The location of the new Story file is: ${relativePath}
    `);
  }

  const storyName = storyNameFromExport(data.exportedStoryName);
  const storyId = toId(autoTitle as string, storyName);

  return storyId;
}
