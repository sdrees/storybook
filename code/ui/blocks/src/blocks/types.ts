export const PRIMARY_STORY = '^';

// TODO

export type Component = any;

export interface StoryData {
  id?: string;
  kind?: string;
  name?: string;
  parameters?: any;
}

export type DocsStoryProps = StoryData & {
  expanded?: boolean;
  withToolbar?: boolean;
};
