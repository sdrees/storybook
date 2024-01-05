import React, { Fragment, useMemo } from 'react';
import { useAddonState, useChannel, useGlobals, useParameter } from '@storybook/manager-api';
import { styled } from '@storybook/theming';
import { IconButton, WithTooltip, TooltipLinkList } from '@storybook/components';

import { PaintBrushIcon } from '@storybook/icons';
import type { ThemeAddonState, ThemeParameters } from './constants';
import {
  PARAM_KEY,
  THEME_SWITCHER_ID,
  THEMING_EVENTS,
  DEFAULT_ADDON_STATE,
  DEFAULT_THEME_PARAMETERS,
} from './constants';

const IconButtonLabel = styled.div(({ theme }) => ({
  fontSize: theme.typography.size.s2 - 1,
  marginLeft: 10,
}));

const hasMultipleThemes = (themesList: ThemeAddonState['themesList']) => themesList.length > 1;

export const ThemeSwitcher = () => {
  const { themeOverride } = useParameter<ThemeParameters>(
    PARAM_KEY,
    DEFAULT_THEME_PARAMETERS
  ) as ThemeParameters;
  const [{ theme: selected }, updateGlobals] = useGlobals();

  const [{ themesList, themeDefault }, updateState] = useAddonState<ThemeAddonState>(
    THEME_SWITCHER_ID,
    DEFAULT_ADDON_STATE
  );

  useChannel({
    [THEMING_EVENTS.REGISTER_THEMES]: ({ themes, defaultTheme }) => {
      updateState((state) => ({
        ...state,
        themesList: themes,
        themeDefault: defaultTheme,
      }));
    },
  });

  const label = useMemo(() => {
    if (themeOverride) {
      return <>Story override</>;
    }

    const themeName = selected || themeDefault;

    return themeName && <>{`${themeName} theme`}</>;
  }, [themeOverride, themeDefault, selected]);

  return hasMultipleThemes(themesList) ? (
    <Fragment>
      <WithTooltip
        placement="top"
        trigger="click"
        closeOnOutsideClick
        tooltip={({ onHide }) => {
          return (
            <TooltipLinkList
              links={themesList.map((theme) => ({
                id: theme,
                title: theme,
                active: selected === theme,
                onClick: () => {
                  updateGlobals({ theme });
                  onHide();
                },
              }))}
            />
          );
        }}
      >
        <IconButton key={THEME_SWITCHER_ID} active={!themeOverride} title="Theme">
          <PaintBrushIcon />
          {label && <IconButtonLabel>{label}</IconButtonLabel>}
        </IconButton>
      </WithTooltip>
    </Fragment>
  ) : null;
};
