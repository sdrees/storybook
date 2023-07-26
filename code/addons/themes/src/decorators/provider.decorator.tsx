import React from 'react';
import { useMemo } from '@storybook/preview-api';
import type { DecoratorFunction, Renderer } from '@storybook/types';

import { initializeThemeState, pluckThemeFromContext, useThemeParameters } from './helpers';

type Theme = Record<string, any>;
type ThemeMap = Record<string, Theme>;

export interface ProviderStrategyConfiguration {
  Provider?: any;
  GlobalStyles?: any;
  defaultTheme?: string;
  themes?: ThemeMap;
}

const pluckThemeFromKeyPairTuple = ([_, themeConfig]: [string, Theme]): Theme => themeConfig;

export const withThemeFromJSXProvider = <TRenderer extends Renderer = Renderer>({
  Provider,
  GlobalStyles,
  defaultTheme,
  themes = {},
}: ProviderStrategyConfiguration): DecoratorFunction<TRenderer> => {
  const themeNames = Object.keys(themes);
  const initialTheme = defaultTheme || themeNames[0];

  initializeThemeState(themeNames, initialTheme);

  // eslint-disable-next-line react/display-name
  return (storyFn, context) => {
    const { themeOverride } = useThemeParameters();
    const selected = pluckThemeFromContext(context);

    const theme = useMemo(() => {
      const selectedThemeName = themeOverride || selected || initialTheme;
      const pairs = Object.entries(themes);

      return pairs.length === 1 ? pluckThemeFromKeyPairTuple(pairs[0]) : themes[selectedThemeName];
    }, [themes, selected, themeOverride]);

    if (!Provider) {
      return (
        <>
          {GlobalStyles && <GlobalStyles />}
          {storyFn()}
        </>
      );
    }

    return (
      <Provider theme={theme}>
        {GlobalStyles && <GlobalStyles />}
        {storyFn()}
      </Provider>
    );
  };
};
