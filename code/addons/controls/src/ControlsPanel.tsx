import type { FC } from 'react';
import React from 'react';
import {
  useArgs,
  useGlobals,
  useArgTypes,
  useParameter,
  useStorybookState,
} from '@storybook/manager-api';
import {
  PureArgsTable as ArgsTable,
  NoControlsWarning,
  type PresetColor,
  type SortType,
} from '@storybook/blocks';

import type { API_ArgTypes } from '@storybook/types';
import { PARAM_KEY } from './constants';

interface ControlsParameters {
  sort?: SortType;
  expanded?: boolean;
  presetColors?: PresetColor[];
  hideNoControlsWarning?: boolean;
}

export const ControlsPanel: FC = () => {
  const [args, updateArgs, resetArgs] = useArgs();
  const [globals] = useGlobals();
  const rows = useArgTypes();
  const isArgsStory = useParameter<boolean>('__isArgsStory', false);
  const {
    expanded,
    sort,
    presetColors,
    hideNoControlsWarning = false,
  } = useParameter<ControlsParameters>(PARAM_KEY, {});
  const { path } = useStorybookState();

  const hasControls = Object.values(rows).some((arg) => arg?.control);
  const showWarning = !(hasControls && isArgsStory) && !hideNoControlsWarning;

  const withPresetColors = Object.entries(rows).reduce((acc, [key, arg]) => {
    if (arg?.control?.type !== 'color' || arg?.control?.presetColors) acc[key] = arg;
    else acc[key] = { ...arg, control: { ...arg.control, presetColors } };
    return acc;
  }, {} as API_ArgTypes);

  return (
    <>
      {showWarning && <NoControlsWarning />}
      <ArgsTable
        {...{
          key: path, // resets state when switching stories
          compact: !expanded && hasControls,
          rows: withPresetColors,
          args,
          globals,
          updateArgs,
          resetArgs,
          inAddonPanel: true,
          sort,
        }}
      />
    </>
  );
};
