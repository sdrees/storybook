import type { StoryId, ComponentTitle, StoryName, Parameters, Tag, Path } from './csf';

interface StoriesSpecifier {
  /**
   * When auto-titling, what to prefix all generated titles with (default: '')
   */
  titlePrefix?: string;
  /**
   * Where to start looking for story files
   */
  directory: string;
  /**
   * What does the filename of a story file look like?
   * (a glob, relative to directory, no leading `./`)
   * If unset, we use `** / *.@(mdx|stories.@(mdx|tsx|ts|jsx|js))` (no spaces)
   */
  files?: string;
}

export type StoriesEntry = string | StoriesSpecifier;

export type NormalizedStoriesSpecifier = Required<StoriesSpecifier> & {
  /*
   * Match the "importPath" of a file (e.g. `./src/button/Button.stories.js')
   * relative to the current working directory.
   */
  importPathMatcher: RegExp;
};

export interface IndexerOptions {
  makeTitle: (userTitle?: string) => string;
}

export interface IndexedStory {
  id: string;
  name: string;
  tags?: Tag[];
  parameters?: Parameters;
}
export interface IndexedCSFFile {
  meta: { title?: string; tags?: Tag[] };
  stories: IndexedStory[];
}

export interface StoryIndexer {
  test: RegExp;
  indexer: (fileName: string, options: IndexerOptions) => Promise<IndexedCSFFile>;
}

export interface BaseIndexEntry {
  id: StoryId;
  name: StoryName;
  title: ComponentTitle;
  tags?: Tag[];
  importPath: Path;
}
export type StoryIndexEntry = BaseIndexEntry & {
  type: 'story';
};

export type DocsIndexEntry = BaseIndexEntry & {
  storiesImports: Path[];
  type: 'docs';
  standalone: boolean;
};

/** A StandaloneDocsIndexExtry represents a file who's default export is directly renderable */
export type StandaloneDocsIndexEntry = DocsIndexEntry & { standalone: true };
/** A TemplateDocsIndexEntry represents a stories file that gets rendered in "docs" mode */
export type TemplateDocsIndexEntry = DocsIndexEntry & { standalone: false };

export type IndexEntry = StoryIndexEntry | DocsIndexEntry;

export interface V2CompatIndexEntry extends Omit<StoryIndexEntry, 'type'> {
  kind: ComponentTitle;
  story: StoryName;
  parameters: Parameters;
}

export interface StoryIndexV3 {
  v: number;
  stories: Record<StoryId, V2CompatIndexEntry>;
}

export interface StoryIndex {
  v: number;
  entries: Record<StoryId, IndexEntry>;
}
