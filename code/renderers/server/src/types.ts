import type { StoryContext as StoryContextBase, WebFramework } from '@storybook/types';

export type { RenderContext } from '@storybook/types';

export type StoryFnServerReturnType = any;
export type StoryContext = StoryContextBase<ServerFramework>;

export interface ServerFramework extends WebFramework {
  component: string;
  storyResult: StoryFnServerReturnType;
}

export type FetchStoryHtmlType = (
  url: string,
  id: string,
  params: any,
  context: StoryContext
) => Promise<string | Node>;

export interface ShowErrorArgs {
  title: string;
  description: string;
}
