import type {
  Addon_IndexEntry,
  AnyFramework,
  Store_CSFFile,
  Store_Story,
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
 * A TemplateDocsRender is a render of a docs entry that is rendered with (an) attached CSF file(s).
 *
 * The expectation is the primary CSF file which is the `importPath` for the entry will
 * define a story which may contain the actual rendered JSX code for the template in the
 * `docs.page` parameter.
 *
 * Use cases:
 *  - Docs Page, where there is no parameter, and we fall back to the globally defined template.
 *  - *.stories.mdx files, where the MDX compiler produces a CSF file with a `.parameter.docs.page`
 *      parameter containing the compiled content of the MDX file.
 */
export class TemplateDocsRender<TFramework extends AnyFramework> implements Render<TFramework> {
  public readonly type: RenderType = 'docs';

  public readonly id: StoryId;

  public story?: Store_Story<TFramework>;

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

    const { importPath, title } = this.entry;
    const primaryCsfFile = this.store.processCSFFileWithCache<TFramework>(
      entryExports,
      importPath,
      title
    );

    // We use the first ("primary") story from the CSF as the "current" story on the context.
    //   - When rendering "true" CSF files, this is for back-compat, where templates may expect
    //     a story to be current (even though now we render a separate docs entry from the stories)
    //   - when rendering a "docs only" (story) id, this will end up being the same story as
    //     this.id, as such "CSF files" have only one story
    const primaryStoryId = Object.keys(primaryCsfFile.stories)[0];
    this.story = this.store.storyFromCSFFile({ storyId: primaryStoryId, csfFile: primaryCsfFile });

    this.csfFiles = [primaryCsfFile, ...csfFiles];

    this.preparing = false;
  }

  isEqual(other: Render<TFramework>): boolean {
    return !!(
      this.id === other.id &&
      this.story &&
      this.story === (other as TemplateDocsRender<TFramework>).story
    );
  }

  async renderToElement(
    canvasElement: HTMLElement,
    renderStoryToElement: DocsContextProps['renderStoryToElement']
  ) {
    if (!this.story || !this.csfFiles) throw new Error('Cannot render docs before preparing');

    const docsContext = new DocsContext<TFramework>(
      this.channel,
      this.store,
      renderStoryToElement,
      this.csfFiles,
      true
    );

    const { docs: docsParameter } = this.story.parameters || {};

    if (!docsParameter)
      throw new Error(
        `Cannot render a story in viewMode=docs if \`@storybook/addon-docs\` is not installed`
      );

    const renderer = await docsParameter.renderer();
    const { render } = renderer as { render: DocsRenderFunction<TFramework> };
    const renderDocs = async () => {
      await new Promise<void>((r) => render(docsContext, docsParameter, canvasElement, r));
      this.channel.emit(DOCS_RENDERED, this.id);
    };

    this.rerender = async () => renderDocs();
    this.teardownRender = async ({ viewModeChanged }: { viewModeChanged?: boolean }) => {
      if (!viewModeChanged || !canvasElement) return;
      renderer.unmount(canvasElement);
    };

    return renderDocs();
  }

  async teardown({ viewModeChanged }: { viewModeChanged?: boolean } = {}) {
    this.teardownRender?.({ viewModeChanged });
    this.torndown = true;
  }
}
