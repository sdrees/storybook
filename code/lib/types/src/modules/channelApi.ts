import type {
  Args,
  ArgTypes,
  ComponentId,
  Parameters,
  StoryId,
  StoryKind,
  ViewMode,
  Globals,
  GlobalTypes,
} from './csf';

// The data received on the (legacy) `setStories` event
export interface SetStoriesStory {
  id: StoryId;
  name: string;
  refId?: string;
  componentId?: ComponentId;
  kind: StoryKind;
  parameters: {
    fileName: string;
    options: {
      [optionName: string]: any;
    };
    docsOnly?: boolean;
    viewMode?: ViewMode;
    [parameterName: string]: any;
  };
  argTypes?: ArgTypes;
  args?: Args;
  initialArgs?: Args;
}

export interface SetStoriesStoryData {
  [id: string]: SetStoriesStory;
}

export type SetStoriesPayload =
  | {
      v: 2;
      error?: Error;
      globals: Args;
      globalParameters: Parameters;
      stories: SetStoriesStoryData;
      kindParameters: {
        [kind: string]: Parameters;
      };
    }
  | ({
      v?: number;
      stories: SetStoriesStoryData;
    } & Record<string, never>);

export interface SetGlobalsPayload {
  globals: Globals;
  globalTypes: GlobalTypes;
}
