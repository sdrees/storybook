import type { FC } from 'react';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import mapValues from 'lodash/mapValues';
import type { ArgTypesExtractor } from '@storybook/docs-tools';
import { filterArgTypes } from '@storybook/store';
import type { Store_PropDescriptor, StrictArgTypes, Args, Globals } from '@storybook/types';
import {
  STORY_ARGS_UPDATED,
  UPDATE_STORY_ARGS,
  RESET_STORY_ARGS,
  GLOBALS_UPDATED,
} from '@storybook/core-events';
import type { ArgsTableProps as PureArgsTableProps, SortType } from '../components';
import { ArgsTable as PureArgsTable, ArgsTableError, TabbedArgsTable } from '../components';

import type { DocsContextProps } from './DocsContext';
import { DocsContext } from './DocsContext';
import type { Component } from './types';
import { PRIMARY_STORY } from './types';
import { getComponentName } from './utils';
import { useStory } from './useStory';

interface BaseProps {
  include?: Store_PropDescriptor;
  exclude?: Store_PropDescriptor;
  sort?: SortType;
}

type OfProps = BaseProps & {
  of: '^' | Component;
};

type ComponentsProps = BaseProps & {
  components: {
    [label: string]: Component;
  };
};

type StoryProps = BaseProps & {
  story: '.' | '^' | string;
  showComponent?: boolean;
};

type ArgsTableProps = BaseProps | OfProps | ComponentsProps | StoryProps;

const useArgs = (
  storyId: string,
  context: DocsContextProps
): [Args, (args: Args) => void, (argNames?: string[]) => void] => {
  const storyContext = context.getStoryContext(context.storyById());

  const [args, setArgs] = useState(storyContext.args);
  useEffect(() => {
    const cb = (changed: { storyId: string; args: Args }) => {
      if (changed.storyId === storyId) {
        setArgs(changed.args);
      }
    };
    context.channel.on(STORY_ARGS_UPDATED, cb);
    return () => context.channel.off(STORY_ARGS_UPDATED, cb);
  }, [storyId]);
  const updateArgs = useCallback(
    (updatedArgs) => context.channel.emit(UPDATE_STORY_ARGS, { storyId, updatedArgs }),
    [storyId]
  );
  const resetArgs = useCallback(
    (argNames?: string[]) => context.channel.emit(RESET_STORY_ARGS, { storyId, argNames }),
    [storyId]
  );
  return [args, updateArgs, resetArgs];
};

const useGlobals = (context: DocsContextProps): [Globals] => {
  const storyContext = context.getStoryContext(context.storyById());
  const [globals, setGlobals] = useState(storyContext.globals);

  useEffect(() => {
    const cb = (changed: { globals: Globals }) => {
      setGlobals(changed.globals);
    };
    context.channel.on(GLOBALS_UPDATED, cb);
    return () => context.channel.off(GLOBALS_UPDATED, cb);
  }, []);

  return [globals];
};

export const extractComponentArgTypes = (
  component: Component,
  context: DocsContextProps,
  include?: Store_PropDescriptor,
  exclude?: Store_PropDescriptor
): StrictArgTypes => {
  const { parameters } = context.storyById();
  const { extractArgTypes }: { extractArgTypes: ArgTypesExtractor } = parameters.docs || {};
  if (!extractArgTypes) {
    throw new Error(ArgsTableError.ARGS_UNSUPPORTED);
  }
  let argTypes = extractArgTypes(component);
  argTypes = filterArgTypes(argTypes, include, exclude);

  return argTypes;
};

const isShortcut = (value?: string) => {
  return value && [PRIMARY_STORY].includes(value);
};

export const getComponent = (props: ArgsTableProps = {}, context: DocsContextProps): Component => {
  const { of } = props as OfProps;
  const { story } = props as StoryProps;
  const { component } = context.storyById();
  if (isShortcut(of) || isShortcut(story)) {
    return component || null;
  }
  if (!of) {
    throw new Error(ArgsTableError.NO_COMPONENT);
  }
  return of;
};

const addComponentTabs = (
  tabs: Record<string, PureArgsTableProps>,
  components: Record<string, Component>,
  context: DocsContextProps,
  include?: Store_PropDescriptor,
  exclude?: Store_PropDescriptor,
  sort?: SortType
) => ({
  ...tabs,
  ...mapValues(components, (comp) => ({
    rows: extractComponentArgTypes(comp, context, include, exclude),
    sort,
  })),
});

export const StoryTable: FC<
  StoryProps & { component: Component; subcomponents: Record<string, Component> }
> = (props) => {
  const context = useContext(DocsContext);
  const {
    story: storyName,
    component,
    subcomponents,
    showComponent,
    include,
    exclude,
    sort,
  } = props;
  try {
    let storyId;
    switch (storyName) {
      case PRIMARY_STORY: {
        const primaryStory = context.storyById();
        storyId = primaryStory.id;
        break;
      }
      default: {
        storyId = context.storyIdByName(storyName);
      }
    }

    const story = useStory(storyId, context);
    // eslint-disable-next-line prefer-const
    let [args, updateArgs, resetArgs] = useArgs(storyId, context);

    const [globals] = useGlobals(context);
    if (!story) return <PureArgsTable isLoading updateArgs={updateArgs} resetArgs={resetArgs} />;

    const argTypes = filterArgTypes(story.argTypes, include, exclude);

    const mainLabel = getComponentName(component) || 'Story';

    let tabs = { [mainLabel]: { rows: argTypes, args, globals, updateArgs, resetArgs } } as Record<
      string,
      PureArgsTableProps
    >;

    // Use the dynamically generated component tabs if there are no controls
    const storyHasArgsWithControls = argTypes && Object.values(argTypes).find((v) => !!v?.control);

    if (!storyHasArgsWithControls) {
      updateArgs = null;
      resetArgs = null;
      tabs = {};
    }

    if (component && (!storyHasArgsWithControls || showComponent)) {
      tabs = addComponentTabs(tabs, { [mainLabel]: component }, context, include, exclude);
    }

    if (subcomponents) {
      if (Array.isArray(subcomponents)) {
        throw new Error(
          `Unexpected subcomponents array. Expected an object whose keys are tab labels and whose values are components.`
        );
      }
      tabs = addComponentTabs(tabs, subcomponents, context, include, exclude);
    }
    return <TabbedArgsTable tabs={tabs} sort={sort} />;
  } catch (err) {
    return <PureArgsTable error={err.message} />;
  }
};

export const ComponentsTable: FC<ComponentsProps> = (props) => {
  const context = useContext(DocsContext);
  const { components, include, exclude, sort } = props;

  const tabs = addComponentTabs({}, components, context, include, exclude);
  return <TabbedArgsTable tabs={tabs} sort={sort} />;
};

export const ArgsTable: FC<ArgsTableProps> = (props) => {
  const context = useContext(DocsContext);
  const {
    parameters: { controls },
    subcomponents,
  } = context.storyById();

  const { include, exclude, components, sort: sortProp } = props as ComponentsProps;
  const { story: storyName } = props as StoryProps;

  const sort = sortProp || controls?.sort;

  const main = getComponent(props, context);
  if (storyName) {
    return <StoryTable {...(props as StoryProps)} component={main} {...{ subcomponents, sort }} />;
  }

  if (!components && !subcomponents) {
    let mainProps;
    try {
      mainProps = { rows: extractComponentArgTypes(main, context, include, exclude) };
    } catch (err) {
      mainProps = { error: err.message };
    }

    return <PureArgsTable {...mainProps} sort={sort} />;
  }

  if (components) {
    return <ComponentsTable {...(props as ComponentsProps)} {...{ components, sort }} />;
  }

  const mainLabel = getComponentName(main);
  return (
    <ComponentsTable
      {...(props as ComponentsProps)}
      components={{ [mainLabel]: main, ...subcomponents }}
      sort={sort}
    />
  );
};

ArgsTable.defaultProps = {
  of: PRIMARY_STORY,
};
