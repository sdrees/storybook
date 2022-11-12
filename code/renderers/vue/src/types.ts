import type { StoryContext as StoryContextBase, WebFramework } from '@storybook/types';
import type { Component, AsyncComponent } from 'vue';

export type { RenderContext } from '@storybook/types';

export interface ShowErrorArgs {
  title: string;
  description: string;
}

export type StoryFnVueReturnType =
  | Component<any, any, any, any>
  | AsyncComponent<any, any, any, any>;

export type StoryContext = StoryContextBase<VueFramework>;

export interface VueFramework extends WebFramework {
  component: Component<any, any, any, any> | AsyncComponent<any, any, any, any>;
  storyResult: StoryFnVueReturnType;
}
