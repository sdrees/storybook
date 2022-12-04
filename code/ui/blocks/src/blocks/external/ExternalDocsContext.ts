import type {
  Renderer,
  CSFFile,
  ModuleExport,
  ModuleExports,
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
    private processMetaExports: (metaExports: ModuleExports) => CSFFile<TRenderer>
  ) {
    super(channel, store, renderStoryToElement, [], true);
  }

  setMeta = (metaExports: ModuleExports) => {
    const csfFile = this.processMetaExports(metaExports);
    this.referenceCSFFile(csfFile, true);
  };

  storyIdByModuleExport(storyExport: ModuleExport, metaExports?: ModuleExports) {
    if (metaExports) {
      const csfFile = this.processMetaExports(metaExports);
      this.referenceCSFFile(csfFile, false);
    }

    // This will end up looking up the story id in the CSF file referenced above or via setMeta()
    return super.storyIdByModuleExport(storyExport);
  }
}
