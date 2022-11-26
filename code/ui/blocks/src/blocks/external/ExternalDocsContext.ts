import type {
  Renderer,
  Store_CSFFile,
  Store_ModuleExport,
  Store_ModuleExports,
  DocsContextProps,
} from '@storybook/types';
import { DocsContext } from '@storybook/preview-api';
import type { StoryStore } from '@storybook/preview-api';
import type { Channel } from '@storybook/channels';

export class ExternalDocsContext<TRenderer extends Renderer> extends DocsContext<TRenderer> {
  constructor(
    public channel: Channel,
    protected store: StoryStore<TRenderer>,
    public renderStoryToElement: DocsContextProps['renderStoryToElement'],
    private processMetaExports: (metaExports: Store_ModuleExports) => Store_CSFFile<TRenderer>
  ) {
    super(channel, store, renderStoryToElement, [], true);
  }

  setMeta = (metaExports: Store_ModuleExports) => {
    const csfFile = this.processMetaExports(metaExports);
    this.referenceCSFFile(csfFile, true);
  };

  storyIdByModuleExport(storyExport: Store_ModuleExport, metaExports?: Store_ModuleExports) {
    if (metaExports) {
      const csfFile = this.processMetaExports(metaExports);
      this.referenceCSFFile(csfFile, false);
    }

    // This will end up looking up the story id in the CSF file referenced above or via setMeta()
    return super.storyIdByModuleExport(storyExport);
  }
}
