import type { IndexEntry, Renderer, CSFFile, PreparedStory, StoryId } from '@storybook/types';
import type { Channel } from '@storybook/channels';
import { DOCS_RENDERED } from '@storybook/core-events';
import type { StoryStore } from '../../../store';

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
export class TemplateDocsRender<TRenderer extends Renderer> implements Render<TRenderer> {
  public readonly type: RenderType = 'docs';

  public readonly id: StoryId;

  public story?: PreparedStory<TRenderer>;

  public rerender?: () => Promise<void>;

  public teardownRender?: (options: { viewModeChanged?: boolean }) => Promise<void>;

  public torndown = false;

  public readonly disableKeyListeners = false;

  public preparing = false;

  private csfFiles?: CSFFile<TRenderer>[];

  constructor(
    protected channel: Channel,
    protected store: StoryStore<TRenderer>,
    public entry: IndexEntry
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
    const primaryCsfFile = this.store.processCSFFileWithCache<TRenderer>(
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

  isEqual(other: Render<TRenderer>): boolean {
    return !!(
      this.id === other.id &&
      this.story &&
      this.story === (other as TemplateDocsRender<TRenderer>).story
    );
  }

  async renderToElement(
    canvasElement: TRenderer['canvasElement'],
    renderStoryToElement: DocsContextProps['renderStoryToElement']
  ) {
    if (!this.story || !this.csfFiles) throw new Error('Cannot render docs before preparing');

    const docsContext = new DocsContext<TRenderer>(
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
    const { render } = renderer as { render: DocsRenderFunction<TRenderer> };
    const renderDocs = async () => {
      await new Promise<void>((r) =>
        // NOTE: it isn't currently possible to use a docs renderer outside of "web" mode.
        render(docsContext, docsParameter, canvasElement as any, r)
      );
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
