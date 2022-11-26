/* eslint-disable @typescript-eslint/naming-convention */
import type { Addon_StoryApi, Addon_Type } from './addons';
import type { Store_RenderContext } from './store';
import type {
  Args,
  ArgTypes,
  DecoratorFunction,
  Renderer,
  LoaderFunction,
  Parameters,
  LegacyStoryFn,
  StoryContext,
  StoryFn,
  StoryId,
  StoryIdentifier,
  StoryKind,
  StoryName,
  ViewMode,
} from './csf';

export interface ClientAPI_ErrorLike {
  message: string;
  stack: string;
}

// Metadata about a story that can be set at various levels: global, for a kind, or for a single story.
export interface ClientAPI_StoryMetadata {
  parameters?: Parameters;
  decorators?: DecoratorFunction[];
  loaders?: LoaderFunction[];
}
export type ClientAPI_ArgTypesEnhancer = (context: StoryContext) => ArgTypes;
export type ClientAPI_ArgsEnhancer = (context: StoryContext) => Args;

type StorySpecifier = StoryId | { name: StoryName; kind: StoryKind } | '*';

export interface ClientAPI_StoreSelectionSpecifier {
  storySpecifier: StorySpecifier;
  viewMode: ViewMode;
  singleStory?: boolean;
  args?: Args;
  globals?: Args;
}

export interface ClientAPI_StoreSelection {
  storyId: StoryId;
  viewMode: ViewMode;
}

export type ClientAPI_AddStoryArgs = StoryIdentifier & {
  storyFn: StoryFn<any>;
  parameters?: Parameters;
  decorators?: DecoratorFunction[];
  loaders?: LoaderFunction[];
};

export type ClientAPI_ClientApiReturnFn<StoryFnReturnType> = (
  ...args: any[]
) => Addon_StoryApi<StoryFnReturnType>;

export interface ClientAPI_ClientApiAddon<StoryFnReturnType = unknown> extends Addon_Type {
  apply: (a: Addon_StoryApi<StoryFnReturnType>, b: any[]) => any;
}

export interface ClientAPI_ClientApiAddons<StoryFnReturnType> {
  [key: string]: ClientAPI_ClientApiAddon<StoryFnReturnType>;
}

export type ClientAPI_RenderContextWithoutStoryContext = Omit<Store_RenderContext, 'storyContext'>;

export interface ClientAPI_GetStorybookStory<TRenderer extends Renderer> {
  name: string;
  render: LegacyStoryFn<TRenderer>;
}

export interface ClientAPI_GetStorybookKind<TRenderer extends Renderer> {
  kind: string;
  fileName: string;
  stories: ClientAPI_GetStorybookStory<TRenderer>[];
}
