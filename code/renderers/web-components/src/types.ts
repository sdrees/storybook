import type { StoryContext as StoryContextBase, WebFramework } from '@storybook/types';
import type { TemplateResult, SVGTemplateResult } from 'lit-html';

export type StoryFnHtmlReturnType = string | Node | TemplateResult | SVGTemplateResult;

export type StoryContext = StoryContextBase<WebComponentsFramework>;

export interface WebComponentsFramework extends WebFramework {
  component: string;
  storyResult: StoryFnHtmlReturnType;
}

export interface ShowErrorArgs {
  title: string;
  description: string;
}
