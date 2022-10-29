/* eslint-disable @typescript-eslint/naming-convention */
import type { API_ViewMode } from './api';
import type { DocsOptions } from './core-common';
import type {
  Args,
  ArgTypes,
  ComponentId,
  Parameters,
  ComponentTitle,
  StoryId,
  StoryKind,
  StoryName,
  Conditional,
  Globals,
  GlobalTypes,
  Path,
  Tag,
} from './csf';

export interface API_BaseEntry {
  id: StoryId;
  depth: number;
  name: string;
  refId?: string;
  renderLabel?: (item: API_BaseEntry) => any;

  /** @deprecated */
  isRoot: boolean;
  /** @deprecated */
  isComponent: boolean;
  /** @deprecated */
  isLeaf: boolean;
}

export interface API_RootEntry extends API_BaseEntry {
  type: 'root';
  startCollapsed?: boolean;
  children: StoryId[];

  /** @deprecated */
  isRoot: true;
  /** @deprecated */
  isComponent: false;
  /** @deprecated */
  isLeaf: false;
}

export interface API_GroupEntry extends API_BaseEntry {
  type: 'group';
  parent?: StoryId;
  children: StoryId[];

  /** @deprecated */
  isRoot: false;
  /** @deprecated */
  isComponent: false;
  /** @deprecated */
  isLeaf: false;
}

export interface API_ComponentEntry extends API_BaseEntry {
  type: 'component';
  parent?: StoryId;
  children: StoryId[];

  /** @deprecated */
  isRoot: false;
  /** @deprecated */
  isComponent: true;
  /** @deprecated */
  isLeaf: false;
}

export interface API_DocsEntry extends API_BaseEntry {
  type: 'docs';
  parent: StoryId;
  title: ComponentTitle;
  /** @deprecated */
  kind: ComponentTitle;
  importPath: Path;

  /** @deprecated */
  isRoot: false;
  /** @deprecated */
  isComponent: false;
  /** @deprecated */
  isLeaf: true;
}

export interface API_StoryEntry extends API_BaseEntry {
  type: 'story';
  parent: StoryId;
  title: ComponentTitle;
  /** @deprecated */
  kind: ComponentTitle;
  importPath: Path;
  tags: Tag[];
  prepared: boolean;
  parameters?: {
    [parameterName: string]: any;
  };
  args?: Args;
  argTypes?: ArgTypes;
  initialArgs?: Args;

  /** @deprecated */
  isRoot: false;
  /** @deprecated */
  isComponent: false;
  /** @deprecated */
  isLeaf: true;
}

export type API_LeafEntry = API_DocsEntry | API_StoryEntry;
export type API_HashEntry =
  | API_RootEntry
  | API_GroupEntry
  | API_ComponentEntry
  | API_DocsEntry
  | API_StoryEntry;

/** @deprecated */
export type API_Root = API_RootEntry;

/** @deprecated */
export type API_Group = API_GroupEntry | API_ComponentEntry;

/** @deprecated */
export type API_Story = API_LeafEntry;

/**
 * The `StoriesHash` is our manager-side representation of the `StoryIndex`.
 * We create entries in the hash not only for each story or docs entry, but
 * also for each "group" of the component (split on '/'), as that's how things
 * are manipulated in the manager (i.e. in the sidebar)
 */
export interface API_StoriesHash {
  [id: string]: API_HashEntry;
}

// The data received on the (legacy) `setStories` event
export interface API_SetStoriesStory {
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
    viewMode?: API_ViewMode;
    [parameterName: string]: any;
  };
  argTypes?: ArgTypes;
  args?: Args;
  initialArgs?: Args;
}

export interface API_SetStoriesStoryData {
  [id: string]: API_SetStoriesStory;
}

export interface API_StoryKey {
  id: StoryId;
  refId?: string;
}

export type API_SetStoriesPayload =
  | {
      v: 2;
      error?: Error;
      globals: Args;
      globalParameters: Parameters;
      stories: API_SetStoriesStoryData;
      kindParameters: {
        [kind: string]: Parameters;
      };
    }
  | ({
      v?: number;
      stories: API_SetStoriesStoryData;
    } & Record<string, never>);

interface API_BaseIndexEntry {
  id: StoryId;
  name: StoryName;
  title: ComponentTitle;
  importPath: Path;
}

export type API_StoryIndexEntry = API_BaseIndexEntry & {
  type?: 'story';
};

interface API_V3IndexEntry extends API_BaseIndexEntry {
  parameters?: Parameters;
}

export interface API_StoryIndexV3 {
  v: 3;
  stories: Record<StoryId, API_V3IndexEntry>;
}

export type API_DocsIndexEntry = API_BaseIndexEntry & {
  storiesImports: Path[];
  type: 'docs';
};

export type API_IndexEntry = API_StoryIndexEntry | API_DocsIndexEntry;
export interface StoryIndex {
  v: number;
  entries: Record<StoryId, API_IndexEntry>;
}

// We used to received a bit more data over the channel on the SET_STORIES event, including
// the full parameters for each story.
type API_PreparedIndexEntry = API_IndexEntry & {
  parameters?: Parameters;
  argTypes?: ArgTypes;
  args?: Args;
  initialArgs?: Args;
};
export interface API_PreparedStoryIndex {
  v: number;
  entries: Record<StoryId, API_PreparedIndexEntry>;
}

export interface API_StoryIndex {
  v: number;
  entries: Record<StoryId, API_IndexEntry>;
}

export type API_OptionsData = {
  docsOptions: DocsOptions;
};

export interface API_Args {
  [key: string]: any;
}

export interface API_ArgType {
  name?: string;
  description?: string;
  defaultValue?: any;
  if?: Conditional;
  [key: string]: any;
}

export interface API_ArgTypes {
  [key: string]: API_ArgType;
}

export interface API_ReleaseNotes {
  success?: boolean;
  currentVersion?: string;
  showOnFirstLaunch?: boolean;
}

export interface API_Settings {
  lastTrackedStoryId: string;
}

export interface API_SetGlobalsPayload {
  globals: Globals;
  globalTypes: GlobalTypes;
}

export interface API_Version {
  version: string;
  info?: { plain: string };
  [key: string]: any;
}

export interface API_UnknownEntries {
  [key: string]: {
    [key: string]: any;
  };
}

export interface API_Versions {
  latest?: API_Version;
  next?: API_Version;
  current?: API_Version;
}
