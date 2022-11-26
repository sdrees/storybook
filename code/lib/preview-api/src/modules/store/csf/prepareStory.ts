import { dedent } from 'ts-dedent';
import deprecate from 'util-deprecate';
import global from 'global';

import type {
  Renderer,
  Args,
  ArgsStoryFn,
  LegacyStoryFn,
  Parameters,
  PlayFunction,
  PlayFunctionContext,
  StepLabel,
  Store_NormalizedComponentAnnotations,
  Store_NormalizedProjectAnnotations,
  Store_NormalizedStoryAnnotations,
  Store_Story,
  StoryContext,
  StoryContextForEnhancers,
  StoryContextForLoaders,
  StrictArgTypes,
} from '@storybook/types';
import { includeConditionalArg } from '@storybook/csf';

import { applyHooks } from '../../addons';
import { combineParameters } from '../parameters';
import { defaultDecorateStory } from '../decorators';
import { groupArgsByTarget, NO_TARGET_NAME } from '../args';
import { getValuesFromArgTypes } from './getValuesFromArgTypes';

const argTypeDefaultValueWarning = deprecate(
  () => {},
  dedent`
  \`argType.defaultValue\` is deprecated and will be removed in Storybook 7.0.

  https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#no-longer-inferring-default-values-of-args`
);

// Combine all the metadata about a story (both direct and inherited from the component/global scope)
// into a "renderable" story function, with all decorators applied, parameters passed as context etc
//
// Note that this story function is *stateless* in the sense that it does not track args or globals
// Instead, it is expected these are tracked separately (if necessary) and are passed into each invocation.
export function prepareStory<TRenderer extends Renderer>(
  storyAnnotations: Store_NormalizedStoryAnnotations<TRenderer>,
  componentAnnotations: Store_NormalizedComponentAnnotations<TRenderer>,
  projectAnnotations: Store_NormalizedProjectAnnotations<TRenderer>
): Store_Story<TRenderer> {
  // NOTE: in the current implementation we are doing everything once, up front, rather than doing
  // anything at render time. The assumption is that as we don't load all the stories at once, this
  // will have a limited cost. If this proves misguided, we can refactor it.

  const { moduleExport, id, name } = storyAnnotations;
  const { title } = componentAnnotations;

  const tags = [...(storyAnnotations.tags || componentAnnotations.tags || []), 'story'];

  const parameters: Parameters = combineParameters(
    projectAnnotations.parameters,
    componentAnnotations.parameters,
    storyAnnotations.parameters
  );

  const decorators = [
    ...(storyAnnotations.decorators || []),
    ...(componentAnnotations.decorators || []),
    ...(projectAnnotations.decorators || []),
  ];

  // Currently it is only possible to set these globally
  const {
    applyDecorators = defaultDecorateStory,
    argTypesEnhancers = [],
    argsEnhancers = [],
    runStep,
  } = projectAnnotations;

  const loaders = [
    ...(projectAnnotations.loaders || []),
    ...(componentAnnotations.loaders || []),
    ...(storyAnnotations.loaders || []),
  ];

  // The render function on annotations *has* to be an `ArgsStoryFn`, so when we normalize
  // CSFv1/2, we use a new field called `userStoryFn` so we know that it can be a LegacyStoryFn
  const render =
    storyAnnotations.userStoryFn ||
    storyAnnotations.render ||
    componentAnnotations.render ||
    projectAnnotations.render;

  if (!render) throw new Error(`No render function available for storyId '${id}'`);
  const passedArgTypes: StrictArgTypes = combineParameters(
    projectAnnotations.argTypes,
    componentAnnotations.argTypes,
    storyAnnotations.argTypes
  ) as StrictArgTypes;

  const { passArgsFirst = true } = parameters;
  // eslint-disable-next-line no-underscore-dangle
  parameters.__isArgsStory = passArgsFirst && render.length > 0;

  // Pull out args[X] into initialArgs for argTypes enhancers
  const passedArgs: Args = {
    ...projectAnnotations.args,
    ...componentAnnotations.args,
    ...storyAnnotations.args,
  } as Args;

  const contextForEnhancers: StoryContextForEnhancers<TRenderer> = {
    componentId: componentAnnotations.id,
    title,
    kind: title, // Back compat
    id,
    name,
    story: name, // Back compat
    component: componentAnnotations.component,
    subcomponents: componentAnnotations.subcomponents,
    tags,
    parameters,
    initialArgs: passedArgs,
    argTypes: passedArgTypes,
  };

  contextForEnhancers.argTypes = argTypesEnhancers.reduce(
    (accumulatedArgTypes, enhancer) =>
      enhancer({ ...contextForEnhancers, argTypes: accumulatedArgTypes }),
    contextForEnhancers.argTypes
  );

  // Add argTypes[X].defaultValue to initial args (note this deprecated)
  // We need to do this *after* the argTypesEnhancers as they may add defaultValues
  const defaultArgs = getValuesFromArgTypes(contextForEnhancers.argTypes);

  if (Object.keys(defaultArgs).length > 0) {
    argTypeDefaultValueWarning();
  }

  const initialArgsBeforeEnhancers = { ...defaultArgs, ...passedArgs };

  contextForEnhancers.initialArgs = argsEnhancers.reduce(
    (accumulatedArgs: Args, enhancer) => ({
      ...accumulatedArgs,
      ...enhancer({
        ...contextForEnhancers,
        initialArgs: accumulatedArgs,
      }),
    }),
    initialArgsBeforeEnhancers
  );

  // Add some of our metadata into parameters as we used to do this in 6.x and users may be relying on it
  if (!global.FEATURES?.breakingChangesV7) {
    contextForEnhancers.parameters = {
      ...contextForEnhancers.parameters,
      __id: id,
      globals: projectAnnotations.globals,
      globalTypes: projectAnnotations.globalTypes,
      args: contextForEnhancers.initialArgs,
      argTypes: contextForEnhancers.argTypes,
    };
  }

  const applyLoaders = async (context: StoryContextForLoaders<TRenderer>) => {
    const loadResults = await Promise.all(loaders.map((loader) => loader(context)));
    const loaded = Object.assign({}, ...loadResults);
    return { ...context, loaded };
  };

  const undecoratedStoryFn: LegacyStoryFn<TRenderer> = (context: StoryContext<TRenderer>) => {
    const mappedArgs = Object.entries(context.args).reduce((acc, [key, val]) => {
      const mapping = context.argTypes[key]?.mapping;
      acc[key] = mapping && val in mapping ? mapping[val] : val;
      return acc;
    }, {} as Args);

    const includedArgs = Object.entries(mappedArgs).reduce((acc, [key, val]) => {
      const argType = context.argTypes[key] || {};
      if (includeConditionalArg(argType, mappedArgs, context.globals)) acc[key] = val;
      return acc;
    }, {} as Args);

    const includedContext = { ...context, args: includedArgs };
    const { passArgsFirst: renderTimePassArgsFirst = true } = context.parameters;
    return renderTimePassArgsFirst
      ? (render as ArgsStoryFn<TRenderer>)(includedContext.args, includedContext)
      : (render as LegacyStoryFn<TRenderer>)(includedContext);
  };
  const decoratedStoryFn = applyHooks<TRenderer>(applyDecorators)(undecoratedStoryFn, decorators);
  const unboundStoryFn = (context: StoryContext<TRenderer>) => {
    let finalContext: StoryContext<TRenderer> = context;
    if (global.FEATURES?.argTypeTargetsV7) {
      const argsByTarget = groupArgsByTarget(context);
      finalContext = {
        ...context,
        allArgs: context.args,
        argsByTarget,
        args: argsByTarget[NO_TARGET_NAME] || {},
      };
    }

    return decoratedStoryFn(finalContext);
  };
  const { play } = storyAnnotations;
  const playFunction =
    play &&
    (async (storyContext: StoryContext<TRenderer>) => {
      const playFunctionContext: PlayFunctionContext<TRenderer> = {
        ...storyContext,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        step: (label: StepLabel, play: PlayFunction<TRenderer>) =>
          // TODO: We know runStep is defined, we need a proper normalized annotations type
          runStep!(label, play, playFunctionContext),
      };
      return play(playFunctionContext);
    });

  return Object.freeze({
    ...contextForEnhancers,
    moduleExport,
    originalStoryFn: render,
    undecoratedStoryFn,
    unboundStoryFn,
    applyLoaders,
    playFunction,
  });
}
