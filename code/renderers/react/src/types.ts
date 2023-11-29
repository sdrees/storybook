import type { ComponentType } from 'react';
import type { WebRenderer } from '@storybook/types';

export type { RenderContext, StoryContext } from '@storybook/types';

/**
 * @deprecated Use `ReactRenderer` instead.
 */
export type ReactFramework = ReactRenderer;
export interface ReactRenderer extends WebRenderer {
  component: ComponentType<this['T']>;
  storyResult: StoryFnReactReturnType;
}

export interface ShowErrorArgs {
  title: string;
  description: string;
}

export type StoryFnReactReturnType = JSX.Element;
