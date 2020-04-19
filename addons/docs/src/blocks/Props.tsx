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
import { Component, CURRENT_SELECTION } from './types';
import { getComponentName } from './utils';
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
  showComponents?: boolean;
};

type PropsProps = BaseProps | OfProps | ComponentsProps | StoryProps;

const useArgs = (storyId: string, storyStore: StoryStore): [Args, (args: Args) => void] => {
  const story = storyStore.fromId(storyId);
  if (!story) {
    throw new Error(`Unknown story: ${storyId}`);
  }

  const { args: initialArgs } = story;
  const [args, setArgs] = useState(initialArgs);
  useEffect(() => {
    const cb = (changedId: string, newArgs: Args) => {
      if (changedId === storyId) {
        setArgs(newArgs);
      }
    };
    storyStore._channel.on(Events.STORY_ARGS_UPDATED, cb);
    return () => storyStore._channel.off(Events.STORY_ARGS_UPDATED, cb);
  }, [storyId]);
  const updateArgs = useCallback((newArgs) => storyStore.updateStoryArgs(storyId, newArgs), [
    storyId,
  ]);
  return [args, updateArgs];
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

export const StoryTable: FC<StoryProps & { components: Record<string, Component> }> = (props) => {
  const context = useContext(DocsContext);
  const {
    id: currentId,
    parameters: { argTypes },
    storyStore,
  } = context;
  const { story, showComponents, components, include, exclude } = props;
  let storyArgTypes;
  try {
    let storyId;
    if (story === CURRENT_SELECTION) {
      storyId = currentId;
      storyArgTypes = argTypes;
    } else {
      storyId = lookupStoryId(story, context);
      const data = storyStore.fromId(storyId);
      storyArgTypes = data.parameters.argTypes;
    }
    storyArgTypes = filterArgTypes(storyArgTypes, include, exclude);
    const [args, updateArgs] = useArgs(storyId, storyStore);
    let tabs = { Story: { rows: storyArgTypes, args, updateArgs } } as Record<
      string,
      ArgsTableProps
    >;
    if (showComponents) {
      tabs = addComponentTabs(tabs, components, context, include, exclude);
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

  let allComponents = components;
  const main = getComponent(props, context);

  if (!allComponents && main) {
    const mainLabel = getComponentName(main);
    allComponents = { [mainLabel]: main, ...subcomponents };
  }

  if (story) {
    return <StoryTable {...(props as StoryProps)} components={allComponents} />;
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

  return <ComponentsTable {...(props as ComponentsProps)} components={allComponents} />;
};

Props.defaultProps = {
  of: CURRENT_SELECTION,
};
