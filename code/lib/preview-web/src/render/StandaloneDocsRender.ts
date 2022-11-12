import type {
  Addon_IndexEntry,
  Framework,
  Store_CSFFile,
  Store_ModuleExports,
  StoryId,
} from '@storybook/types';
import type { StoryStore } from '@storybook/store';
import type { Channel } from '@storybook/channels';
import { DOCS_RENDERED } from '@storybook/core-events';

import type { Render, RenderType } from './Render';
import { PREPARE_ABORTED } from './Render';
import type { DocsContextProps } from '../docs-context/DocsContextProps';
import type { DocsRenderFunction } from '../docs-context/DocsRenderFunction';
import { DocsContext } from '../docs-context/DocsContext';

/**
 * A StandaloneDocsRender is a render of a docs entry that doesn't directly come from a CSF file.
 *
 * A standalone render can reference zero or more CSF files that contain stories.
 *
 * Use cases:
 *  - *.mdx file that may or may not reference a specific CSF file with `<Meta of={} />`
 */

export class StandaloneDocsRender<TFramework extends Framework> implements Render<TFramework> {
  public readonly type: RenderType = 'docs';

  public readonly id: StoryId;

  private exports?: Store_ModuleExports;

  public rerender?: () => Promise<void>;

  public teardownRender?: (options: { viewModeChanged?: boolean }) => Promise<void>;

  public torndown = false;

  public readonly disableKeyListeners = false;

  public preparing = false;

  private csfFiles?: Store_CSFFile<TFramework>[];

  constructor(
    protected channel: Channel,
    protected store: StoryStore<TFramework>,
    public entry: Addon_IndexEntry
  ) {
    this.id = entry.id;
  }

  isPreparing() {
    return this.preparing;
  }

  async prepare() {
    this.preparing = true;
    const { entryExports, csfFiles = [] } = await this.store.loadEntry(this.id);
    if (this.torndown) throw PREPARE_ABORTED;

    this.csfFiles = csfFiles;
    this.exports = entryExports;

    this.preparing = false;
  }

  isEqual(other: Render<TFramework>): boolean {
    return !!(
      this.id === other.id &&
      this.exports &&
      this.exports === (other as StandaloneDocsRender<TFramework>).exports
    );
  }

  async renderToElement(
    canvasElement: TFramework['canvasElement'],
    renderStoryToElement: DocsContextProps['renderStoryToElement']
  ) {
    if (!this.exports || !this.csfFiles || !this.store.projectAnnotations)
      throw new Error('Cannot render docs before preparing');

    const docsContext = new DocsContext<TFramework>(
      this.channel,
      this.store,
      renderStoryToElement,
      this.csfFiles,
      false
    );

    const { docs } = this.store.projectAnnotations.parameters || {};

    if (!docs)
      throw new Error(
        `Cannot render a story in viewMode=docs if \`@storybook/addon-docs\` is not installed`
      );

    const docsParameter = { ...docs, page: this.exports.default };
    const renderer = await docs.renderer();
    const { render } = renderer as { render: DocsRenderFunction<TFramework> };
    const renderDocs = async () => {
      await new Promise<void>((r) =>
        // NOTE: it isn't currently possible to use a docs renderer outside of "web" mode.
        render(docsContext, docsParameter, canvasElement as any, r)
      );
      this.channel.emit(DOCS_RENDERED, this.id);
    };

    this.rerender = async () => renderDocs();
    this.teardownRender = async ({ viewModeChanged }: { viewModeChanged?: boolean } = {}) => {
      if (!viewModeChanged || !canvasElement) return;
      renderer.unmount(canvasElement);
      this.torndown = true;
    };

    return renderDocs();
  }

  async teardown({ viewModeChanged }: { viewModeChanged?: boolean } = {}) {
    this.teardownRender?.({ viewModeChanged });
    this.torndown = true;
  }
}
