import type {
  Renderer,
  Store_CSFFile,
  Store_ModuleExport,
  Store_ModuleExports,
  Store_Story,
  StoryContextForLoaders,
  StoryId,
  StoryName,
} from '@storybook/types';
import type { Channel } from '@storybook/channels';
import type { StoryStore } from '../../store';

import type { DocsContextProps } from './DocsContextProps';

export class DocsContext<TRenderer extends Renderer> implements DocsContextProps<TRenderer> {
  private componentStoriesValue: Store_Story<TRenderer>[];

  private storyIdToCSFFile: Map<StoryId, Store_CSFFile<TRenderer>>;

  private exportToStoryId: Map<Store_ModuleExport, StoryId>;

  private nameToStoryId: Map<StoryName, StoryId>;

  private primaryStory?: Store_Story<TRenderer>;

  constructor(
    public channel: Channel,
    protected store: StoryStore<TRenderer>,
    public renderStoryToElement: DocsContextProps['renderStoryToElement'],
    /** The CSF files known (via the index) to be refererenced by this docs file */
    csfFiles: Store_CSFFile<TRenderer>[],
    componentStoriesFromAllCsfFiles = true
  ) {
    this.storyIdToCSFFile = new Map();
    this.exportToStoryId = new Map();
    this.nameToStoryId = new Map();
    this.componentStoriesValue = [];

    csfFiles.forEach((csfFile, index) => {
      this.referenceCSFFile(csfFile, componentStoriesFromAllCsfFiles || index === 0);
    });
  }

  // This docs entry references this CSF file and can syncronously load the stories, as well
  // as reference them by module export. If the CSF is part of the "component" stories, they
  // can also be referenced by name and are in the componentStories list.
  referenceCSFFile(csfFile: Store_CSFFile<TRenderer>, addToComponentStories: boolean) {
    Object.values(csfFile.stories).forEach((annotation) => {
      this.storyIdToCSFFile.set(annotation.id, csfFile);
      this.exportToStoryId.set(annotation.moduleExport, annotation.id);
    });

    if (addToComponentStories) {
      this.store.componentStoriesFromCSFFile({ csfFile }).forEach((story) => {
        this.nameToStoryId.set(story.name, story.id);
        this.componentStoriesValue.push(story);
        if (!this.primaryStory) this.primaryStory = story;
      });
    }
  }

  setMeta(metaExports: Store_ModuleExports) {
    // Do nothing (this is really only used by external docs)
  }

  storyIdByModuleExport(storyExport: Store_ModuleExport, metaExports?: Store_ModuleExports) {
    const storyId = this.exportToStoryId.get(storyExport);
    if (storyId) return storyId;

    throw new Error(`No story found with that export: ${storyExport}`);
  }

  storyIdByName = (storyName: StoryName) => {
    const storyId = this.nameToStoryId.get(storyName);
    if (storyId) return storyId;

    throw new Error(`No story found with that name: ${storyName}`);
  };

  componentStories = () => {
    return this.componentStoriesValue;
  };

  storyById = (storyId?: StoryId) => {
    if (!storyId) {
      if (!this.primaryStory)
        throw new Error(
          `No primary story defined for docs entry. Did you forget to use \`<Meta>\`?`
        );

      return this.primaryStory;
    }
    const csfFile = this.storyIdToCSFFile.get(storyId);
    if (!csfFile)
      throw new Error(`Called \`storyById\` for story that was never loaded: ${storyId}`);
    return this.store.storyFromCSFFile({ storyId, csfFile });
  };

  getStoryContext = (story: Store_Story<TRenderer>) => {
    return {
      ...this.store.getStoryContext(story),
      viewMode: 'docs',
    } as StoryContextForLoaders<TRenderer>;
  };

  loadStory = (id: StoryId) => {
    return this.store.loadStory({ storyId: id });
  };
}
