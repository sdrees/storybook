import type {
  ArgsStoryFn,
  StoryContext as DefaultStoryContext,
  WebRenderer,
} from '@storybook/types';

import type { parameters } from './config';

export type { RenderContext } from '@storybook/types';

export type StoryFnHtmlReturnType = string | Node;

export interface ShowErrorArgs {
  title: string;
  description: string;
}

/**
 * @deprecated Use `HtmlRenderer` instead.
 */
export type HtmlFramework = HtmlRenderer;
export interface HtmlRenderer extends WebRenderer {
  component: string | HTMLElement | ArgsStoryFn<HtmlRenderer>;
  storyResult: StoryFnHtmlReturnType;
}

export type StoryContext = DefaultStoryContext<HtmlRenderer> & {
  parameters: DefaultStoryContext<HtmlRenderer>['parameters'] & typeof parameters;
};
