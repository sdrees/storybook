import type { ComponentType } from 'react';
import type { WebRenderer } from 'storybook/internal/types';

export type { RenderContext, StoryContext } from 'storybook/internal/types';

export interface ReactRenderer extends WebRenderer {
  component: ComponentType<this['T']>;
  storyResult: StoryFnReactReturnType;
}

export interface ShowErrorArgs {
  title: string;
  description: string;
}

export type StoryFnReactReturnType = JSX.Element;
