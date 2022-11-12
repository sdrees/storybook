import type { WebFramework } from '@storybook/types';
import type { AnyComponent } from 'preact';

export type { RenderContext } from '@storybook/types';

export type StoryFnPreactReturnType = string | Node | preact.JSX.Element;

export interface ShowErrorArgs {
  title: string;
  description: string;
}

export interface PreactFramework extends WebFramework {
  component: AnyComponent<any, any>;
  storyResult: StoryFnPreactReturnType;
}
