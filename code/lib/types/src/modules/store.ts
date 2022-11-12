/* eslint-disable @typescript-eslint/naming-convention */
import type { SynchronousPromise } from 'synchronous-promise';
import type { Framework, ProjectAnnotations as CsfProjectAnnotations } from '@storybook/csf';

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

export interface WebFramework extends Framework {
  canvasElement: HTMLElement;
}

export type Store_ModuleExport = any;
export type Store_ModuleExports = Record<string, Store_ModuleExport>;
export type Store_PromiseLike<T> = Promise<T> | SynchronousPromise<T>;
export type Store_ModuleImportFn = (path: Path) => Store_PromiseLike<Store_ModuleExports>;

type Store_MaybePromise<T> = Promise<T> | T;

export type TeardownRenderToCanvas = () => Store_MaybePromise<void>;
export type RenderToCanvas<TFramework extends Framework> = (
  context: Store_RenderContext<TFramework>,
  element: TFramework['canvasElement']
) => Store_MaybePromise<void | TeardownRenderToCanvas>;

export type ProjectAnnotations<TFramework extends Framework> = CsfProjectAnnotations<TFramework> & {
  renderToCanvas?: RenderToCanvas<TFramework>;

  /* @deprecated use renderToCanvas */
  renderToDOM?: RenderToCanvas<TFramework>;
};

export type Store_NormalizedProjectAnnotations<TFramework extends Framework = Framework> =
  ProjectAnnotations<TFramework> & {
    argTypes?: StrictArgTypes;
    globalTypes?: StrictGlobalTypes;
  };

export type Store_NormalizedComponentAnnotations<TFramework extends Framework = Framework> =
  ComponentAnnotations<TFramework> & {
    // Useful to guarantee that id & title exists
    id: ComponentId;
    title: ComponentTitle;
    argTypes?: StrictArgTypes;
  };

export type Store_NormalizedStoryAnnotations<TFramework extends Framework = Framework> = Omit<
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

export type Store_CSFFile<TFramework extends Framework = Framework> = {
  meta: Store_NormalizedComponentAnnotations<TFramework>;
  stories: Record<StoryId, Store_NormalizedStoryAnnotations<TFramework>>;
};

export type Store_Story<TFramework extends Framework = Framework> =
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

export type Store_BoundStory<TFramework extends Framework = Framework> = Store_Story<TFramework> & {
  storyFn: PartialStoryFn<TFramework>;
};

export declare type Store_RenderContext<TFramework extends Framework = Framework> =
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

export type Store_DecoratorApplicator<TFramework extends Framework = Framework> = (
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

export type Store_ContextStore<TFramework extends Framework> = {
  value?: StoryContext<TFramework>;
};

export type Store_PropDescriptor = string[] | RegExp;

export type Store_CSFExports<TFramework extends Framework = Framework> = {
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
  TFramework extends Framework = Framework,
  TArgs = Args
> = AnnotatedStoryFn<TFramework, TArgs> & { play: Store_ComposedStoryPlayFn };

export type Store_ComposedStory<TFramework extends Framework = Framework, TArgs = Args> =
  | StoryFn<TFramework, TArgs>
  | StoryAnnotations<TFramework, TArgs>;

/**
 * T represents the whole ES module of a stories file. K of T means named exports (basically the Story type)
 * 1. pick the keys K of T that have properties that are Story<AnyProps>
 * 2. infer the actual prop type for each Story
 * 3. reconstruct Story with Partial. Story<Props> -> Story<Partial<Props>>
 */
export type Store_StoriesWithPartialProps<TFramework extends Framework, TModule> = {
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
  TFramework extends Framework = Framework,
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
