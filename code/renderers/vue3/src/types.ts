import type { AnyFramework, StoryContext as StoryContextBase } from '@storybook/types';
import type { ConcreteComponent } from 'vue';

export type { RenderContext } from '@storybook/types';

export interface ShowErrorArgs {
  title: string;
  description: string;
}

export type StoryFnVueReturnType = ConcreteComponent<any>;

export type StoryContext = StoryContextBase<VueFramework>;

export interface VueFramework extends AnyFramework {
  // We are omitting props, as we don't use it internally, and more importantly, it completely changes the assignability of meta.component.
  // Try not omitting, and check the type errros in the test file, if you want to learn more.
  component: Omit<ConcreteComponent<this['T']>, 'props'>;
  storyResult: StoryFnVueReturnType;
}
