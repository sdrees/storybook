/* eslint-disable @typescript-eslint/naming-convention */

import type {
  AnnotatedStoryFn,
  AnyFramework,
  Args,
  ArgsEnhancer,
  ArgsFromMeta,
  ArgsStoryFn,
  ArgTypes,
  ArgTypesEnhancer,
  BaseAnnotations,
  ComponentAnnotations,
  ComponentId,
  ComponentTitle,
  Conditional,
  DecoratorApplicator,
  DecoratorFunction,
  Globals,
  GlobalTypes,
  IncludeExcludeOptions,
  InputType,
  LegacyAnnotatedStoryFn,
  LegacyStoryAnnotationsOrFn,
  LegacyStoryFn,
  LoaderFunction,
  Parameters as ParametersBase,
  PartialStoryFn,
  PlayFunction,
  PlayFunctionContext,
  ProjectAnnotations,
  SBArrayType,
  SBEnumType,
  SBIntersectionType,
  SBObjectType,
  SBOtherType,
  SBScalarType,
  SBType,
  SBUnionType,
  SeparatorOptions,
  StepFunction,
  StepLabel,
  StepRunner,
  StoryAnnotations,
  StoryAnnotationsOrFn,
  StoryContext,
  StoryContextForEnhancers,
  StoryContextForLoaders,
  StoryContextUpdate,
  StoryFn,
  StoryId,
  StoryIdentifier,
  StoryKind,
  StoryName,
  StrictArgTypes,
  StrictGlobalTypes,
  StrictInputType,
  Tag,
  ViewMode as ViewModeBase,
} from '@storybook/csf';
import type { Addon_OptionsParameter } from './addons';

export type {
  AnnotatedStoryFn,
  AnyFramework,
  Args,
  ArgsEnhancer,
  ArgsFromMeta,
  ArgsStoryFn,
  ArgTypes,
  ArgTypesEnhancer,
  BaseAnnotations,
  ComponentAnnotations,
  ComponentId,
  ComponentTitle,
  Conditional,
  DecoratorApplicator,
  DecoratorFunction,
  Globals,
  GlobalTypes,
  IncludeExcludeOptions,
  InputType,
  LegacyAnnotatedStoryFn,
  LegacyStoryAnnotationsOrFn,
  LegacyStoryFn,
  LoaderFunction,
  PartialStoryFn,
  PlayFunction,
  PlayFunctionContext,
  ProjectAnnotations,
  SBArrayType,
  SBEnumType,
  SBIntersectionType,
  SBObjectType,
  SBOtherType,
  SBScalarType,
  SBType,
  SBUnionType,
  SeparatorOptions,
  StepFunction,
  StepLabel,
  StepRunner,
  StoryAnnotations,
  StoryAnnotationsOrFn,
  StoryContext,
  StoryContextForEnhancers,
  StoryContextForLoaders,
  StoryContextUpdate,
  StoryFn,
  StoryId,
  StoryIdentifier,
  StoryKind,
  StoryName,
  StrictArgTypes,
  StrictGlobalTypes,
  StrictInputType,
  Tag,
};

export interface CSF_Meta {
  id?: string;
  title?: string;
  component?: string;
  includeStories?: string[] | RegExp;
  excludeStories?: string[] | RegExp;
  tags?: Tag[];
}

export interface CSF_Story {
  id: string;
  name: string;
  parameters: Parameters;
  tags?: Tag[];
}

export type ViewMode = ViewModeBase | 'story' | 'info' | 'settings' | string | undefined;

type Layout = 'centered' | 'fullscreen' | 'padded' | 'none';

export interface Parameters extends ParametersBase {
  fileName?: string;
  options?: Addon_OptionsParameter;
  /** The layout property defines basic styles added to the preview body where the story is rendered. If you pass 'none', no styles are applied. */
  layout?: Layout;
  docsOnly?: boolean;
  [key: string]: any;
}

export type Path = string;
