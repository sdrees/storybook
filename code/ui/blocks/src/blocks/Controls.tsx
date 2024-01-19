/* eslint-disable react/destructuring-assignment */
import type { Renderer, Parameters, StrictArgTypes } from '@storybook/csf';
import type { ModuleExports } from '@storybook/types';
import type { FC } from 'react';
import React, { useContext } from 'react';
import { filterArgTypes } from '@storybook/preview-api';
import type { PropDescriptor } from '@storybook/preview-api';
import type { ArgTypesExtractor } from '@storybook/docs-tools';

import { mapValues } from 'lodash';
import type { SortType } from '../components';
import { ArgsTable as PureArgsTable, ArgsTableError, TabbedArgsTable } from '../components';
import { DocsContext } from './DocsContext';
import { useGlobals } from './useGlobals';
import { useArgs } from './useArgs';
import { getComponentName } from './utils';

type ControlsParameters = {
  include?: PropDescriptor;
  exclude?: PropDescriptor;
  sort?: SortType;
};

type ControlsProps = ControlsParameters & {
  of?: Renderer['component'] | ModuleExports;
};

function extractComponentArgTypes(
  component: Renderer['component'],
  parameters: Parameters
): StrictArgTypes {
  const { extractArgTypes }: { extractArgTypes: ArgTypesExtractor } = parameters.docs || {};
  if (!extractArgTypes) {
    throw new Error(ArgsTableError.ARGS_UNSUPPORTED);
  }
  return extractArgTypes(component);
}

export const Controls: FC<ControlsProps> = (props) => {
  const { of } = props;
  if ('of' in props && of === undefined) {
    throw new Error('Unexpected `of={undefined}`, did you mistype a CSF file reference?');
  }

  const context = useContext(DocsContext);
  const { story } = context.resolveOf(of || 'story', ['story']);
  const { parameters, argTypes, component, subcomponents } = story;
  const controlsParameters = parameters.docs?.controls || ({} as ControlsParameters);

  const include = props.include ?? controlsParameters.include;
  const exclude = props.exclude ?? controlsParameters.exclude;
  const sort = props.sort ?? controlsParameters.sort;

  const [args, updateArgs, resetArgs] = useArgs(story, context);
  const [globals] = useGlobals(story, context);

  const filteredArgTypes = filterArgTypes(argTypes, include, exclude);

  const hasSubcomponents = Boolean(subcomponents) && Object.keys(subcomponents).length > 0;

  if (!hasSubcomponents) {
    return (
      <PureArgsTable
        rows={filteredArgTypes}
        sort={sort}
        args={args}
        globals={globals}
        updateArgs={updateArgs}
        resetArgs={resetArgs}
      />
    );
  }

  const mainComponentName = getComponentName(component);
  const subcomponentTabs = mapValues(subcomponents, (comp) => ({
    rows: filterArgTypes(extractComponentArgTypes(comp, parameters), include, exclude),
    sort,
  }));
  const tabs = {
    [mainComponentName]: { rows: filteredArgTypes, sort },
    ...subcomponentTabs,
  };
  return (
    <TabbedArgsTable
      tabs={tabs}
      sort={sort}
      args={args}
      globals={globals}
      updateArgs={updateArgs}
      resetArgs={resetArgs}
    />
  );
};
