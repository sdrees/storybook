import type { StoryId, AnyFramework } from '@storybook/types';

export type RenderType = 'story' | 'docs';

/**
 * A "Render" represents the rendering of a single entry to a single location
 *
 * The implemenations of render are used for two key purposes:
 *  - Tracking the state of the rendering as it moves between preparing, rendering and tearing down.
 *  - Tracking what is rendered to know if a change requires re-rendering or teardown + recreation.
 */
export interface Render<TFramework extends AnyFramework> {
  type: RenderType;
  id: StoryId;
  isPreparing: () => boolean;
  isEqual: (other: Render<TFramework>) => boolean;
  disableKeyListeners: boolean;
  teardown?: (options: { viewModeChanged: boolean }) => Promise<void>;
  torndown: boolean;
  renderToElement: (canvasElement: HTMLElement, renderStoryToElement?: any) => Promise<void>;
}

export const PREPARE_ABORTED = new Error('prepareAborted');
