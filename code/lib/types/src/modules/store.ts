/* eslint-disable @typescript-eslint/naming-convention */
import type { SynchronousPromise } from 'synchronous-promise';
import type { Addon_IndexEntry, Addon_StoryIndexEntry } from './addons';
import type {
  AnnotatedStoryFn,
  AnyFramework,
  Args,
  ComponentAnnotations,
  ComponentId,
  ComponentTitle,
  DecoratorFunction,
  LegacyStoryFn,
  Parameters,
  PartialStoryFn,
  Path,
  ProjectAnnotations,
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

export type Store_ModuleExport = any;
export type Store_ModuleExports = Record<string, Store_ModuleExport>;
export type Store_PromiseLike<T> = Promise<T> | SynchronousPromise<T>;
export type Store_ModuleImportFn = (path: Path) => Store_PromiseLike<Store_ModuleExports>;

type Store_MaybePromise<T> = Promise<T> | T;

export type Store_TeardownRenderToDOM = () => Store_MaybePromise<void>;
export type Store_RenderToDOM<TFramework extends AnyFramework> = (
  context: Store_RenderContext<TFramework>,
  element: Element
) => Store_MaybePromise<void | Store_TeardownRenderToDOM>;

export type Store_WebProjectAnnotations<TFramework extends AnyFramework> =
  ProjectAnnotations<TFramework> & {
    renderToDOM?: Store_RenderToDOM<TFramework>;
  };

export type Store_NormalizedProjectAnnotations<TFramework extends AnyFramework = AnyFramework> =
  ProjectAnnotations<TFramework> & {
    argTypes?: StrictArgTypes;
    globalTypes?: StrictGlobalTypes;
  };

export type Store_NormalizedComponentAnnotations<TFramework extends AnyFramework = AnyFramework> =
  ComponentAnnotations<TFramework> & {
    // Useful to guarantee that id & title exists
    id: ComponentId;
    title: ComponentTitle;
    argTypes?: StrictArgTypes;
  };

export type Store_NormalizedStoryAnnotations<TFramework extends AnyFramework = AnyFramework> = Omit<
  StoryAnnotations<TFramework>,
  'storyName' | 'story'
> & {
  moduleExport: Store_ModuleExport;
  // You cannot actually set id on story annotations, but we normalize it to be there for convience
  id: StoryId;
  argTypes?: StrictArgTypes;
  name: StoryName;
  userStoryFn?: StoryFn<TFramework>;
};

export type Store_CSFFile<TFramework extends AnyFramework = AnyFramework> = {
  meta: Store_NormalizedComponentAnnotations<TFramework>;
  stories: Record<StoryId, Store_NormalizedStoryAnnotations<TFramework>>;
};

export type Store_Story<TFramework extends AnyFramework = AnyFramework> =
  StoryContextForEnhancers<TFramework> & {
    moduleExport: Store_ModuleExport;
    originalStoryFn: StoryFn<TFramework>;
    undecoratedStoryFn: LegacyStoryFn<TFramework>;
    unboundStoryFn: LegacyStoryFn<TFramework>;
    applyLoaders: (
      context: StoryContextForLoaders<TFramework>
    ) => Promise<
      StoryContextForLoaders<TFramework> & { loaded: StoryContext<TFramework>['loaded'] }
    >;
    playFunction?: (context: StoryContext<TFramework>) => Promise<void> | void;
  };

export type Store_BoundStory<TFramework extends AnyFramework = AnyFramework> =
  Store_Story<TFramework> & {
    storyFn: PartialStoryFn<TFramework>;
  };

export declare type Store_RenderContext<TFramework extends AnyFramework = AnyFramework> =
  StoryIdentifier & {
    showMain: () => void;
    showError: (error: { title: string; description: string }) => void;
    showException: (err: Error) => void;
    forceRemount: boolean;
    storyContext: StoryContext<TFramework>;
    storyFn: PartialStoryFn<TFramework>;
    unboundStoryFn: LegacyStoryFn<TFramework>;
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

export type Store_DecoratorApplicator<TFramework extends AnyFramework = AnyFramework> = (
  storyFn: LegacyStoryFn<TFramework>,
  decorators: DecoratorFunction<TFramework>[]
) => LegacyStoryFn<TFramework>;

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

export type Store_ContextStore<TFramework extends AnyFramework> = {
  value?: StoryContext<TFramework>;
};

export type Store_PropDescriptor = string[] | RegExp;

export type Store_CSFExports<TFramework extends AnyFramework = AnyFramework> = {
  default: ComponentAnnotations<TFramework, Args>;
  __esModule?: boolean;
  __namedExportsOrder?: string[];
};

export type Store_ComposedStoryPlayContext = Partial<StoryContext> &
  Pick<StoryContext, 'canvasElement'>;

export type Store_ComposedStoryPlayFn = (
  context: Store_ComposedStoryPlayContext
) => Promise<void> | void;

export type Store_StoryFn<
  TFramework extends AnyFramework = AnyFramework,
  TArgs = Args
> = AnnotatedStoryFn<TFramework, TArgs> & { play: Store_ComposedStoryPlayFn };

export type Store_ComposedStory<TFramework extends AnyFramework = AnyFramework, TArgs = Args> =
  | StoryFn<TFramework, TArgs>
  | StoryAnnotations<TFramework, TArgs>;

/**
 * T represents the whole ES module of a stories file. K of T means named exports (basically the Story type)
 * 1. pick the keys K of T that have properties that are Story<AnyProps>
 * 2. infer the actual prop type for each Story
 * 3. reconstruct Story with Partial. Story<Props> -> Story<Partial<Props>>
 */
export type Store_StoriesWithPartialProps<TFramework extends AnyFramework, TModule> = {
  // @TODO once we can use Typescript 4.0 do this to exclude nonStory exports:
  // replace [K in keyof TModule] with [K in keyof TModule as TModule[K] extends ComposedStory<any> ? K : never]
  [K in keyof TModule]: TModule[K] extends Store_ComposedStory<infer _, infer TProps>
    ? AnnotatedStoryFn<TFramework, Partial<TProps>>
    : unknown;
};

export type Store_ControlsMatchers = {
  date: RegExp;
  color: RegExp;
};

export interface Store_ComposeStory<
  TFramework extends AnyFramework = AnyFramework,
  TArgs extends Args = Args
> {
  (
    storyAnnotations: AnnotatedStoryFn<TFramework, TArgs> | StoryAnnotations<TFramework, TArgs>,
    componentAnnotations: ComponentAnnotations<TFramework, TArgs>,
    projectAnnotations: ProjectAnnotations<TFramework>,
    exportsName?: string
  ): {
    (extraArgs: Partial<TArgs>): TFramework['storyResult'];
    storyName: string;
    args: Args;
    play: Store_ComposedStoryPlayFn;
    parameters: Parameters;
  };
}
