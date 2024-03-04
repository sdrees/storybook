/* eslint-disable @typescript-eslint/naming-convention */
import { isExportStory } from '@storybook/csf';
import type {
  Renderer,
  Args,
  ComponentAnnotations,
  LegacyStoryAnnotationsOrFn,
  ProjectAnnotations,
  ComposedStoryPlayFn,
  ComposeStoryFn,
  Store_CSFExports,
  StoryContext,
  Parameters,
  ComposedStoryFn,
  StrictArgTypes,
  PlayFunctionContext,
} from '@storybook/types';

import { HooksContext } from '../../../addons';
import { composeConfigs } from './composeConfigs';
import { prepareContext, prepareStory } from './prepareStory';
import { normalizeStory } from './normalizeStory';
import { normalizeComponentAnnotations } from './normalizeComponentAnnotations';
import { getValuesFromArgTypes } from './getValuesFromArgTypes';
import { normalizeProjectAnnotations } from './normalizeProjectAnnotations';

let globalProjectAnnotations: ProjectAnnotations<any> = {};

export function getPortableStoryWrapperId(storyId: string) {
  return `storybook-story-${storyId}`;
}

export function setProjectAnnotations<TRenderer extends Renderer = Renderer>(
  projectAnnotations: ProjectAnnotations<TRenderer> | ProjectAnnotations<TRenderer>[]
) {
  const annotations = Array.isArray(projectAnnotations) ? projectAnnotations : [projectAnnotations];
  globalProjectAnnotations = composeConfigs(annotations);
}

export function composeStory<TRenderer extends Renderer = Renderer, TArgs extends Args = Args>(
  storyAnnotations: LegacyStoryAnnotationsOrFn<TRenderer>,
  componentAnnotations: ComponentAnnotations<TRenderer, TArgs>,
  projectAnnotations?: ProjectAnnotations<TRenderer>,
  defaultConfig?: ProjectAnnotations<TRenderer>,
  exportsName?: string
): ComposedStoryFn<TRenderer, Partial<TArgs>> {
  if (storyAnnotations === undefined) {
    // eslint-disable-next-line local-rules/no-uncategorized-errors
    throw new Error('Expected a story but received undefined.');
  }

  // @TODO: Support auto title

  componentAnnotations.title = componentAnnotations.title ?? 'ComposedStory';
  const normalizedComponentAnnotations =
    normalizeComponentAnnotations<TRenderer>(componentAnnotations);

  const storyName =
    exportsName ||
    storyAnnotations.storyName ||
    storyAnnotations.story?.name ||
    storyAnnotations.name ||
    'Unnamed Story';

  const normalizedStory = normalizeStory<TRenderer>(
    storyName,
    storyAnnotations,
    normalizedComponentAnnotations
  );

  const normalizedProjectAnnotations = normalizeProjectAnnotations<TRenderer>(
    composeConfigs([defaultConfig ?? {}, globalProjectAnnotations, projectAnnotations ?? {}])
  );

  const story = prepareStory<TRenderer>(
    normalizedStory,
    normalizedComponentAnnotations,
    normalizedProjectAnnotations
  );

  const globalsFromGlobalTypes = getValuesFromArgTypes(normalizedProjectAnnotations.globalTypes);

  const context: StoryContext<TRenderer> = {
    hooks: new HooksContext(),
    globals: {
      ...globalsFromGlobalTypes,
      ...normalizedProjectAnnotations.globals,
    },
    args: { ...story.initialArgs },
    viewMode: 'story',
    loaded: {},
    abortSignal: null as unknown as AbortSignal,
    canvasElement: null,
    ...story,
  };

  const playFunction = story.playFunction
    ? async (extraContext: Partial<PlayFunctionContext<TRenderer, TArgs>>) =>
        story.playFunction!({
          ...context,
          ...extraContext,
          // if canvasElement is not provided, we default to the root element, which comes from a decorator
          // the decorator has to be implemented in the defaultAnnotations of each integrator of portable stories
          canvasElement:
            extraContext?.canvasElement ??
            globalThis.document?.getElementById(getPortableStoryWrapperId(context.id)),
        })
    : undefined;

  const composedStory: ComposedStoryFn<TRenderer, Partial<TArgs>> = Object.assign(
    function storyFn(extraArgs?: Partial<TArgs>) {
      context.args = {
        ...context.initialArgs,
        ...extraArgs,
      };

      return story.unboundStoryFn(prepareContext(context));
    },
    {
      id: story.id,
      storyName,
      load: async () => {
        const loadedContext = await story.applyLoaders(context);
        context.loaded = loadedContext.loaded;
      },
      args: story.initialArgs as Partial<TArgs>,
      parameters: story.parameters as Parameters,
      argTypes: story.argTypes as StrictArgTypes<TArgs>,
      play: playFunction as ComposedStoryPlayFn<TRenderer, TArgs> | undefined,
    }
  );

  return composedStory;
}

export function composeStories<TModule extends Store_CSFExports>(
  storiesImport: TModule,
  globalConfig: ProjectAnnotations<Renderer>,
  composeStoryFn: ComposeStoryFn
) {
  const { default: meta, __esModule, __namedExportsOrder, ...stories } = storiesImport;
  const composedStories = Object.entries(stories).reduce((storiesMap, [exportsName, story]) => {
    if (!isExportStory(exportsName, meta)) {
      return storiesMap;
    }

    const result = Object.assign(storiesMap, {
      [exportsName]: composeStoryFn(
        story as LegacyStoryAnnotationsOrFn,
        meta,
        globalConfig,
        exportsName
      ),
    });
    return result;
  }, {});

  return composedStories;
}
