/* eslint-disable react/destructuring-assignment */
import type { Args, Globals, Renderer } from '@storybook/csf';
import type { DocsContextProps, ModuleExports, PreparedStory } from '@storybook/types';
import type { FC } from 'react';
import React, { useCallback, useEffect, useState, useContext } from 'react';
import type { PropDescriptor } from '@storybook/preview-api';
import { filterArgTypes } from '@storybook/preview-api';
import {
  STORY_ARGS_UPDATED,
  UPDATE_STORY_ARGS,
  RESET_STORY_ARGS,
  GLOBALS_UPDATED,
} from '@storybook/core-events';

import type { SortType } from '../components';
import { ArgsTable as PureArgsTable } from '../components';
import { DocsContext } from './DocsContext';

type ControlsParameters = {
  include?: PropDescriptor;
  exclude?: PropDescriptor;
  sort?: SortType;
};

type ControlsProps = ControlsParameters & {
  of?: Renderer['component'] | ModuleExports;
};

const useArgs = (
  story: PreparedStory,
  context: DocsContextProps
): [Args, (args: Args) => void, (argNames?: string[]) => void] => {
  const storyContext = context.getStoryContext(story);
  const { id: storyId } = story;

  const [args, setArgs] = useState(storyContext.args);
  useEffect(() => {
    const onArgsUpdated = (changed: { storyId: string; args: Args }) => {
      if (changed.storyId === storyId) {
        setArgs(changed.args);
      }
    };
    context.channel.on(STORY_ARGS_UPDATED, onArgsUpdated);
    return () => context.channel.off(STORY_ARGS_UPDATED, onArgsUpdated);
  }, [storyId, context.channel]);
  const updateArgs = useCallback(
    (updatedArgs) => context.channel.emit(UPDATE_STORY_ARGS, { storyId, updatedArgs }),
    [storyId, context.channel]
  );
  const resetArgs = useCallback(
    (argNames?: string[]) => context.channel.emit(RESET_STORY_ARGS, { storyId, argNames }),
    [storyId, context.channel]
  );
  return [args, updateArgs, resetArgs];
};

const useGlobals = (story: PreparedStory, context: DocsContextProps): [Globals] => {
  const storyContext = context.getStoryContext(story);

  const [globals, setGlobals] = useState(storyContext.globals);
  useEffect(() => {
    const onGlobalsUpdated = (changed: { globals: Globals }) => {
      setGlobals(changed.globals);
    };
    context.channel.on(GLOBALS_UPDATED, onGlobalsUpdated);
    return () => context.channel.off(GLOBALS_UPDATED, onGlobalsUpdated);
  }, [context.channel]);

  return [globals];
};

export const Controls: FC<ControlsProps> = (props) => {
  const { of } = props;
  const context = useContext(DocsContext);
  const { story } = context.resolveOf(of || 'story', ['story']);
  const { parameters, argTypes } = story;
  const controlsParameters = parameters.docs?.controls || ({} as ControlsParameters);

  const include = props.include ?? controlsParameters.include;
  const exclude = props.exclude ?? controlsParameters.exclude;
  const sort = props.sort ?? controlsParameters.sort;

  const [args, updateArgs, resetArgs] = useArgs(story, context);
  const [globals] = useGlobals(story, context);

  const filteredArgTypes = filterArgTypes(argTypes, include, exclude);

  return (
    <PureArgsTable
      rows={filteredArgTypes}
      args={args}
      globals={globals}
      updateArgs={updateArgs}
      resetArgs={resetArgs}
      sort={sort}
    />
  );
};
