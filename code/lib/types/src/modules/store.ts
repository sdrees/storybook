/* eslint-disable @typescript-eslint/naming-convention */
import type { SynchronousPromise } from 'synchronous-promise';
import type { Renderer, ProjectAnnotations as CsfProjectAnnotations } from '@storybook/csf';

import type { Addon_IndexEntry, Addon_StoryIndexEntry } from './addons';
import type {
  AnnotatedStoryFn,
  Args,
  ComponentAnnotations,
  ComponentId,
  ComponentTitle,
  DecoratorFunction,
  LegacyStoryFn,
  Parameters,
  PartialStoryFn,
  Path,
  StoryAnnotations,
  StoryContext,
  StoryContextForEnhancers,
  StoryContextForLoaders,
  StoryFn,
  StoryId,
  StoryIdentifier,
  StoryName,
  StrictArgTypes,
  StrictGlobalTypes,
  ViewMode,
} from './csf';

export interface WebRenderer extends Renderer {
  canvasElement: HTMLElement;
}

export type Store_ModuleExport = any;
export type Store_ModuleExports = Record<string, Store_ModuleExport>;
export type Store_PromiseLike<T> = Promise<T> | SynchronousPromise<T>;
export type Store_ModuleImportFn = (path: Path) => Store_PromiseLike<Store_ModuleExports>;

type Store_MaybePromise<T> = Promise<T> | T;

export type TeardownRenderToCanvas = () => Store_MaybePromise<void>;
export type RenderToCanvas<TRenderer extends Renderer> = (
  context: Store_RenderContext<TRenderer>,
  element: TRenderer['canvasElement']
) => Store_MaybePromise<void | TeardownRenderToCanvas>;

export type ProjectAnnotations<TRenderer extends Renderer> = CsfProjectAnnotations<TRenderer> & {
  renderToCanvas?: RenderToCanvas<TRenderer>;

  /* @deprecated use renderToCanvas */
  renderToDOM?: RenderToCanvas<TRenderer>;
};

export type Store_NormalizedProjectAnnotations<TRenderer extends Renderer = Renderer> =
  ProjectAnnotations<TRenderer> & {
    argTypes?: StrictArgTypes;
    globalTypes?: StrictGlobalTypes;
  };

export type Store_NormalizedComponentAnnotations<TRenderer extends Renderer = Renderer> =
  ComponentAnnotations<TRenderer> & {
    // Useful to guarantee that id & title exists
    id: ComponentId;
    title: ComponentTitle;
    argTypes?: StrictArgTypes;
  };

export type Store_NormalizedStoryAnnotations<TRenderer extends Renderer = Renderer> = Omit<
  StoryAnnotations<TRenderer>,
  'storyName' | 'story'
> & {
  moduleExport: Store_ModuleExport;
  // You cannot actually set id on story annotations, but we normalize it to be there for convience
  id: StoryId;
  argTypes?: StrictArgTypes;
  name: StoryName;
  userStoryFn?: StoryFn<TRenderer>;
};

export type Store_CSFFile<TRenderer extends Renderer = Renderer> = {
  meta: Store_NormalizedComponentAnnotations<TRenderer>;
  stories: Record<StoryId, Store_NormalizedStoryAnnotations<TRenderer>>;
};

export type Store_Story<TRenderer extends Renderer = Renderer> =
  StoryContextForEnhancers<TRenderer> & {
    moduleExport: Store_ModuleExport;
    originalStoryFn: StoryFn<TRenderer>;
    undecoratedStoryFn: LegacyStoryFn<TRenderer>;
    unboundStoryFn: LegacyStoryFn<TRenderer>;
    applyLoaders: (
      context: StoryContextForLoaders<TRenderer>
    ) => Promise<StoryContextForLoaders<TRenderer> & { loaded: StoryContext<TRenderer>['loaded'] }>;
    playFunction?: (context: StoryContext<TRenderer>) => Promise<void> | void;
  };

export type Store_BoundStory<TRenderer extends Renderer = Renderer> = Store_Story<TRenderer> & {
  storyFn: PartialStoryFn<TRenderer>;
};

export declare type Store_RenderContext<TRenderer extends Renderer = Renderer> = StoryIdentifier & {
  showMain: () => void;
  showError: (error: { title: string; description: string }) => void;
  showException: (err: Error) => void;
  forceRemount: boolean;
  storyContext: StoryContext<TRenderer>;
  storyFn: PartialStoryFn<TRenderer>;
  unboundStoryFn: LegacyStoryFn<TRenderer>;
};

export interface Store_V2CompatIndexEntry extends Omit<Addon_StoryIndexEntry, 'type'> {
  kind: Addon_StoryIndexEntry['title'];
  story: Addon_StoryIndexEntry['name'];
  parameters: Parameters;
}

export interface Store_StoryIndexV3 {
  v: number;
  stories: Record<StoryId, Store_V2CompatIndexEntry>;
}

export interface Store_StoryIndex {
  v: number;
  entries: Record<StoryId, Addon_IndexEntry>;
}

export type Store_StorySpecifier = StoryId | { name: StoryName; title: ComponentTitle } | '*';

export interface Store_SelectionSpecifier {
  storySpecifier: Store_StorySpecifier;
  viewMode: ViewMode;
  args?: Args;
  globals?: Args;
}

export interface Store_Selection {
  storyId: StoryId;
  viewMode: ViewMode;
}

export type Store_DecoratorApplicator<TRenderer extends Renderer = Renderer> = (
  storyFn: LegacyStoryFn<TRenderer>,
  decorators: DecoratorFunction<TRenderer>[]
) => LegacyStoryFn<TRenderer>;

export interface Store_StoriesSpecifier {
  directory: string;
  titlePrefix?: string;
}
export interface Store_NormalizedStoriesSpecifier {
  glob?: string;
  specifier?: Store_StoriesSpecifier;
}

export type Store_ExtractOptions = {
  includeDocsOnly?: boolean;
};

export interface Store_NormalizedStoriesSpecifierEntry {
  titlePrefix?: string;
  directory: string;
  files?: string;
  importPathMatcher: RegExp;
}

export type Store_ContextStore<TRenderer extends Renderer> = {
  value?: StoryContext<TRenderer>;
};

export type Store_PropDescriptor = string[] | RegExp;

export type Store_CSFExports<TRenderer extends Renderer = Renderer> = {
  default: ComponentAnnotations<TRenderer, Args>;
  __esModule?: boolean;
  __namedExportsOrder?: string[];
};

export type Store_ComposedStoryPlayContext = Partial<StoryContext> &
  Pick<StoryContext, 'canvasElement'>;

export type Store_ComposedStoryPlayFn = (
  context: Store_ComposedStoryPlayContext
) => Promise<void> | void;

export type Store_StoryFn<TRenderer extends Renderer = Renderer, TArgs = Args> = AnnotatedStoryFn<
  TRenderer,
  TArgs
> & { play: Store_ComposedStoryPlayFn };

export type Store_ComposedStory<TRenderer extends Renderer = Renderer, TArgs = Args> =
  | StoryFn<TRenderer, TArgs>
  | StoryAnnotations<TRenderer, TArgs>;

/**
 * T represents the whole ES module of a stories file. K of T means named exports (basically the Story type)
 * 1. pick the keys K of T that have properties that are Story<AnyProps>
 * 2. infer the actual prop type for each Story
 * 3. reconstruct Story with Partial. Story<Props> -> Story<Partial<Props>>
 */
export type Store_StoriesWithPartialProps<TRenderer extends Renderer, TModule> = {
  // @TODO once we can use Typescript 4.0 do this to exclude nonStory exports:
  // replace [K in keyof TModule] with [K in keyof TModule as TModule[K] extends ComposedStory<any> ? K : never]
  [K in keyof TModule]: TModule[K] extends Store_ComposedStory<infer _, infer TProps>
    ? AnnotatedStoryFn<TRenderer, Partial<TProps>>
    : unknown;
};

export type Store_ControlsMatchers = {
  date: RegExp;
  color: RegExp;
};

export interface Store_ComposeStory<
  TRenderer extends Renderer = Renderer,
  TArgs extends Args = Args
> {
  (
    storyAnnotations: AnnotatedStoryFn<TRenderer, TArgs> | StoryAnnotations<TRenderer, TArgs>,
    componentAnnotations: ComponentAnnotations<TRenderer, TArgs>,
    projectAnnotations: ProjectAnnotations<TRenderer>,
    exportsName?: string
  ): {
    (extraArgs: Partial<TArgs>): TRenderer['storyResult'];
    storyName: string;
    args: Args;
    play: Store_ComposedStoryPlayFn;
    parameters: Parameters;
  };
}
