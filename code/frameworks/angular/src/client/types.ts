import {
  Parameters as DefaultParameters,
  StoryContext as DefaultStoryContext,
  WebRenderer,
} from '@storybook/types';

export interface NgModuleMetadata {
  declarations?: any[];
  entryComponents?: any[];
  imports?: any[];
  schemas?: any[];
  providers?: any[];
}
export interface ICollection {
  [p: string]: any;
}

export interface StoryFnAngularReturnType {
  /** @deprecated `component` story input is deprecated, and will be removed in Storybook 7.0. */
  component?: any;
  props?: ICollection;
  /** @deprecated `propsMeta` story input is deprecated, and will be removed in Storybook 7.0. */
  propsMeta?: ICollection;
  moduleMetadata?: NgModuleMetadata;
  template?: string;
  styles?: string[];
  userDefinedTemplate?: boolean;
}

/**
 * @deprecated Use `AngularRenderer` instead.
 */
export type AngularFramework = AngularRenderer;
export interface AngularRenderer extends WebRenderer {
  component: any;
  storyResult: StoryFnAngularReturnType;
}

export type Parameters = DefaultParameters & {
  bootstrapModuleOptions?: unknown;
};

export type StoryContext = DefaultStoryContext<AngularRenderer> & { parameters: Parameters };
