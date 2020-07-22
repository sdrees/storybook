/* eslint-disable no-underscore-dangle */
import React, { FC, useContext, useEffect, useState, useCallback } from 'react';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';
import {
  ArgsTable,
  ArgsTableProps,
  ArgsTableError,
  ArgTypes,
  TabbedArgsTable,
} from '@storybook/components';
import { Args } from '@storybook/addons';
import { StoryStore } from '@storybook/client-api';
import Events from '@storybook/core-events';

import { DocsContext, DocsContextProps } from './DocsContext';
import { Component, CURRENT_SELECTION, PRIMARY_STORY } from './types';
import { getComponentName, getDocsStories } from './utils';
import { ArgTypesExtractor } from '../lib/docgen/types';
import { lookupStoryId } from './Story';

type PropDescriptor = string[] | RegExp;

interface BaseProps {
  include?: PropDescriptor;
  exclude?: PropDescriptor;
}

type OfProps = BaseProps & {
  of: '.' | Component;
};

type ComponentsProps = BaseProps & {
  components: {
    [label: string]: Component;
  };
};

type StoryProps = BaseProps & {
  story: '.' | string;
  showComponent?: boolean;
};

type PropsProps = BaseProps | OfProps | ComponentsProps | StoryProps;

const useArgs = (
  storyId: string,
  storyStore: StoryStore
): [Args, (args: Args) => void, (argNames?: string[]) => void] => {
  const story = storyStore.fromId(storyId);
  if (!story) {
    throw new Error(`Unknown story: ${storyId}`);
  }

  const { args: initialArgs } = story;
  const [args, setArgs] = useState(initialArgs);
  useEffect(() => {
    const cb = (changed: { storyId: string; args: Args }) => {
      if (changed.storyId === storyId) {
        setArgs(changed.args);
      }
    };
    storyStore._channel.on(Events.STORY_ARGS_UPDATED, cb);
    return () => storyStore._channel.off(Events.STORY_ARGS_UPDATED, cb);
  }, [storyId]);
  const updateArgs = useCallback((newArgs) => storyStore.updateStoryArgs(storyId, newArgs), [
    storyId,
  ]);
  const resetArgs = useCallback(
    (argNames?: string[]) => storyStore.resetStoryArgs(storyId, argNames),
    [storyId]
  );
  return [args, updateArgs, resetArgs];
};

const matches = (name: string, descriptor: PropDescriptor) =>
  Array.isArray(descriptor) ? descriptor.includes(name) : name.match(descriptor);

const filterArgTypes = (argTypes: ArgTypes, include?: PropDescriptor, exclude?: PropDescriptor) => {
  if (!include && !exclude) {
    return argTypes;
  }
  return (
    argTypes &&
    pickBy(argTypes, (argType, key) => {
      const name = argType.name || key;
      return (!include || matches(name, include)) && (!exclude || !matches(name, exclude));
    })
  );
};

export const extractComponentArgTypes = (
  component: Component,
  { parameters }: DocsContextProps,
  include?: PropDescriptor,
  exclude?: PropDescriptor
): ArgTypes => {
  const params = parameters || {};
  const { extractArgTypes }: { extractArgTypes: ArgTypesExtractor } = params.docs || {};
  if (!extractArgTypes) {
    throw new Error(ArgsTableError.ARGS_UNSUPPORTED);
  }
  let argTypes = extractArgTypes(component);
  argTypes = filterArgTypes(argTypes, include, exclude);

  return argTypes;
};

export const getComponent = (props: PropsProps = {}, context: DocsContextProps): Component => {
  const { of } = props as OfProps;
  const { parameters = {} } = context;
  const { component } = parameters;

  const target = of === CURRENT_SELECTION ? component : of;
  if (!target) {
    if (of === CURRENT_SELECTION) {
      return null;
    }
    throw new Error(ArgsTableError.NO_COMPONENT);
  }
  return target;
};

const addComponentTabs = (
  tabs: Record<string, ArgsTableProps>,
  components: Record<string, Component>,
  context: DocsContextProps,
  include?: PropDescriptor,
  exclude?: PropDescriptor
) => ({
  ...tabs,
  ...mapValues(components, (comp) => ({
    rows: extractComponentArgTypes(comp, context, include, exclude),
  })),
});

export const StoryTable: FC<
  StoryProps & { component: Component; subcomponents: Record<string, Component> }
> = (props) => {
  const context = useContext(DocsContext);
  const {
    id: currentId,
    parameters: { argTypes },
    storyStore,
  } = context;
  const { story, component, subcomponents, showComponent, include, exclude } = props;
  let storyArgTypes;
  try {
    let storyId;
    switch (story) {
      case CURRENT_SELECTION: {
        storyId = currentId;
        storyArgTypes = argTypes;
        break;
      }
      case PRIMARY_STORY: {
        const primaryStory = getDocsStories(context)[0];
        storyId = primaryStory.id;
        storyArgTypes = primaryStory.parameters.argTypes;
        break;
      }
      default: {
        storyId = lookupStoryId(story, context);
        const data = storyStore.fromId(storyId);
        storyArgTypes = data.parameters.argTypes;
      }
    }
    storyArgTypes = filterArgTypes(storyArgTypes, include, exclude);

    // eslint-disable-next-line prefer-const
    let [args, updateArgs, resetArgs] = useArgs(storyId, storyStore);
    let tabs = { Story: { rows: storyArgTypes, args, updateArgs, resetArgs } } as Record<
      string,
      ArgsTableProps
    >;

    // Use the dynamically generated component tabs if there are no controls
    const storyHasArgsWithControls =
      storyArgTypes && Object.values(storyArgTypes).find((v) => !!v?.control);

    if (!storyHasArgsWithControls) {
      updateArgs = null;
      resetArgs = null;
      tabs = {};
    }

    if (component && (!storyHasArgsWithControls || showComponent)) {
      const mainLabel = getComponentName(component);
      tabs = addComponentTabs(tabs, { [mainLabel]: component }, context, include, exclude);
    }

    if (subcomponents) {
      tabs = addComponentTabs(tabs, subcomponents, context, include, exclude);
    }
    return <TabbedArgsTable tabs={tabs} />;
  } catch (err) {
    return <ArgsTable error={err.message} />;
  }
};

export const ComponentsTable: FC<ComponentsProps> = (props) => {
  const context = useContext(DocsContext);
  const { components, include, exclude } = props;

  const tabs = addComponentTabs({}, components, context, include, exclude);
  return <TabbedArgsTable tabs={tabs} />;
};

export const Props: FC<PropsProps> = (props) => {
  const context = useContext(DocsContext);
  const {
    parameters: { subcomponents },
  } = context;

  const { include, exclude, components } = props as ComponentsProps;
  const { story } = props as StoryProps;

  const main = getComponent(props, context);
  if (story) {
    return <StoryTable {...(props as StoryProps)} component={main} subcomponents={subcomponents} />;
  }

  if (!components && !subcomponents) {
    let mainProps;
    try {
      mainProps = { rows: extractComponentArgTypes(main, context, include, exclude) };
    } catch (err) {
      mainProps = { error: err.message };
    }
    return <ArgsTable {...mainProps} />;
  }

  if (components) {
    return <ComponentsTable {...(props as ComponentsProps)} components={components} />;
  }

  const mainLabel = getComponentName(main);
  return (
    <ComponentsTable
      {...(props as ComponentsProps)}
      components={{ [mainLabel]: main, ...subcomponents }}
    />
  );
};

Props.defaultProps = {
  of: CURRENT_SELECTION,
};
