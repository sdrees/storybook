import type { StoryContext as StoryContextBase } from '@storybook/types';
import type { TemplateResult, SVGTemplateResult } from 'lit-html';

export type StoryFnHtmlReturnType = string | Node | TemplateResult | SVGTemplateResult;

export type StoryContext = StoryContextBase<WebComponentsFramework>;

export type WebComponentsFramework = {
  component: string;
  storyResult: StoryFnHtmlReturnType;
};

export interface ShowErrorArgs {
  title: string;
  description: string;
}
