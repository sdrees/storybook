import global from 'global';
import {
  AnyFramework,
  StoryId,
  ViewMode,
  StoryContextForLoaders,
  StoryContext,
} from '@storybook/csf';
import {
  Story,
  RenderContext,
  StoryStore,
  RenderToDOM,
  TeardownRenderToDOM,
} from '@storybook/store';
import { Channel } from '@storybook/addons';
import { logger } from '@storybook/client-logger';
import {
  STORY_RENDER_PHASE_CHANGED,
  STORY_RENDERED,
  PLAY_FUNCTION_THREW_EXCEPTION,
} from '@storybook/core-events';
import { Render, RenderType } from './Render';

const { AbortController } = global;

export type RenderPhase =
  | 'preparing'
  | 'loading'
  | 'rendering'
  | 'playing'
  | 'played'
  | 'completed'
  | 'aborted'
  | 'errored';

function createController(): AbortController {
  if (AbortController) return new AbortController();
  // Polyfill for IE11
  return {
    signal: { aborted: false },
    abort() {
      // @ts-ignore
      this.signal.aborted = true;
    },
  } as AbortController;
}

function serializeError(error: any) {
  try {
    const { name = 'Error', message = String(error), stack } = error;
    return { name, message, stack };
  } catch (e) {
    return { name: 'Error', message: String(error) };
  }
}

export type RenderContextCallbacks<TFramework extends AnyFramework> = Pick<
  RenderContext<TFramework>,
  'showMain' | 'showError' | 'showException'
>;

export const PREPARE_ABORTED = new Error('prepareAborted');

export class StoryRender<TFramework extends AnyFramework> implements Render<TFramework> {
  public type: RenderType = 'story';

  public story?: Story<TFramework>;

  public phase?: RenderPhase;

  private abortController?: AbortController;

  private canvasElement?: HTMLElement;

  private notYetRendered = true;

  public disableKeyListeners = false;

  private teardownRender: TeardownRenderToDOM = () => {};

  public torndown = false;

  constructor(
    public channel: Channel,
    public store: StoryStore<TFramework>,
    private renderToScreen: RenderToDOM<TFramework>,
    private callbacks: RenderContextCallbacks<TFramework>,
    public id: StoryId,
    public viewMode: ViewMode,
    story?: Story<TFramework>
  ) {
    this.abortController = createController();

    // Allow short-circuiting preparing if we happen to already
    // have the story (this is used by docs mode)
    if (story) {
      this.story = story;
      // TODO -- what should the phase be now?
      // TODO -- should we emit the render phase changed event?
      this.phase = 'preparing';
    }
  }

  private async runPhase(signal: AbortSignal, phase: RenderPhase, phaseFn?: () => Promise<void>) {
    this.phase = phase;
    this.channel.emit(STORY_RENDER_PHASE_CHANGED, { newPhase: this.phase, storyId: this.id });
    if (phaseFn) await phaseFn();

    if (signal.aborted) {
      this.phase = 'aborted';
      this.channel.emit(STORY_RENDER_PHASE_CHANGED, { newPhase: this.phase, storyId: this.id });
    }
  }

  async prepare() {
    await this.runPhase((this.abortController as AbortController).signal, 'preparing', async () => {
      this.story = await this.store.loadStory({ storyId: this.id });
    });

    if ((this.abortController as AbortController).signal.aborted) {
      this.store.cleanupStory(this.story as Story<TFramework>);
      throw PREPARE_ABORTED;
    }
  }

  // The two story "renders" are equal and have both loaded the same story
  isEqual(other: Render<TFramework>): boolean {
    return !!(
      this.id === other.id &&
      this.story &&
      this.story === (other as StoryRender<TFramework>).story
    );
  }

  isPreparing() {
    return ['preparing'].includes(this.phase as RenderPhase);
  }

  isPending() {
    return ['rendering', 'playing'].includes(this.phase as RenderPhase);
  }

  async renderToElement(canvasElement: HTMLElement) {
    this.canvasElement = canvasElement;

    // FIXME: this comment
    // Start the first (initial) render. We don't await here because we need to return the "cleanup"
    // function below right away, so if the user changes story during the first render we can cancel
    // it without having to first wait for it to finish.
    // Whenever the selection changes we want to force the component to be remounted.
    return this.render({ initial: true, forceRemount: true });
  }

  private storyContext() {
    if (!this.story) throw new Error(`Cannot call storyContext before preparing`);
    return this.store.getStoryContext(this.story);
  }

  async render({
    initial = false,
    forceRemount = false,
  }: {
    initial?: boolean;
    forceRemount?: boolean;
  } = {}) {
    const { canvasElement } = this;
    if (!this.story) throw new Error('cannot render when not prepared');
    if (!canvasElement) throw new Error('cannot render when canvasElement is unset');

    const { id, componentId, title, name, applyLoaders, unboundStoryFn, playFunction } = this.story;

    if (forceRemount && !initial) {
      // NOTE: we don't check the cancel actually worked here, so the previous
      // render could conceivably still be running after this call.
      // We might want to change that in the future.
      this.cancelRender();
      this.abortController = createController();
    }

    // We need a stable reference to the signal -- if a re-mount happens the
    // abort controller may be torn down (above) before we actually check the signal.
    const abortSignal = (this.abortController as AbortController).signal;

    try {
      let loadedContext: Awaited<ReturnType<typeof applyLoaders>>;
      await this.runPhase(abortSignal, 'loading', async () => {
        loadedContext = await applyLoaders({
          ...this.storyContext(),
          viewMode: this.viewMode,
        } as StoryContextForLoaders<TFramework>);
      });
      if (abortSignal.aborted) {
        return;
      }

      const renderStoryContext: StoryContext<TFramework> = {
        ...loadedContext!,
        // By this stage, it is possible that new args/globals have been received for this story
        // and we need to ensure we render it with the new values
        ...this.storyContext(),
        abortSignal,
        canvasElement,
      };
      const renderContext: RenderContext<TFramework> = {
        componentId,
        title,
        kind: title,
        id,
        name,
        story: name,
        ...this.callbacks,
        showError: (error) => {
          this.phase = 'errored';
          return this.callbacks.showError(error);
        },
        showException: (error) => {
          this.phase = 'errored';
          return this.callbacks.showException(error);
        },
        forceRemount: forceRemount || this.notYetRendered,
        storyContext: renderStoryContext,
        storyFn: () => unboundStoryFn(renderStoryContext),
        unboundStoryFn,
      };

      await this.runPhase(abortSignal, 'rendering', async () => {
        const teardown = await this.renderToScreen(renderContext, canvasElement);
        this.teardownRender = teardown || (() => {});
      });
      this.notYetRendered = false;
      if (abortSignal.aborted) return;

      // The phase should be 'rendering' but it might be set to 'aborted' by another render cycle
      if (forceRemount && playFunction && this.phase !== 'errored') {
        this.disableKeyListeners = true;
        try {
          await this.runPhase(abortSignal, 'playing', async () => {
            await playFunction(renderContext.storyContext);
          });
          await this.runPhase(abortSignal, 'played');
        } catch (error) {
          logger.error(error);
          await this.runPhase(abortSignal, 'errored', async () => {
            this.channel.emit(PLAY_FUNCTION_THREW_EXCEPTION, serializeError(error));
          });
        }
        this.disableKeyListeners = false;
        if (abortSignal.aborted) return;
      }

      await this.runPhase(abortSignal, 'completed', async () =>
        this.channel.emit(STORY_RENDERED, id)
      );
    } catch (err) {
      this.phase = 'errored';
      this.callbacks.showException(err as Error);
    }
  }

  async rerender() {
    return this.render();
  }

  async remount() {
    return this.render({ forceRemount: true });
  }

  // If the story is torn down (either a new story is rendered or the docs page removes it)
  // we need to consider the fact that the initial render may not be finished
  // (possibly the loaders or the play function are still running). We use the controller
  // as a method to abort them, ASAP, but this is not foolproof as we cannot control what
  // happens inside the user's code.
  cancelRender() {
    this.abortController?.abort();
  }

  async teardown(options: {} = {}) {
    this.torndown = true;
    this.cancelRender();

    // If the story has loaded, we need to cleanup
    if (this.story) this.store.cleanupStory(this.story);

    // Check if we're done rendering/playing. If not, we may have to reload the page.
    // Wait several ticks that may be needed to handle the abort, then try again.
    // Note that there's a max of 5 nested timeouts before they're no longer "instant".
    for (let i = 0; i < 3; i += 1) {
      if (!this.isPending()) {
        // eslint-disable-next-line no-await-in-loop
        await this.teardownRender();
        return;
      }
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    // If we still haven't completed, reload the page (iframe) to ensure we have a clean slate
    // for the next render. Since the reload can take a brief moment to happen, we want to stop
    // further rendering by awaiting a never-resolving promise (which is destroyed on reload).
    global.window.location.reload();
    await new Promise(() => {});
  }
}
