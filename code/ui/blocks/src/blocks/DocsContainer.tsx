import type { FunctionComponent, ReactNode } from 'react';
import React, { useEffect } from 'react';
import global from 'global';
import type { ThemeVars } from '@storybook/theming';
import { ThemeProvider, ensure as ensureTheme } from '@storybook/theming';
import type { Framework } from '@storybook/types';
import { DocsWrapper, DocsContent } from '../components';
import type { DocsContextProps } from './DocsContext';
import { DocsContext } from './DocsContext';
import { SourceContainer } from './SourceContainer';
import { scrollToElement } from './utils';

const { document, window: globalWindow } = global;

export interface DocsContainerProps<TFramework extends Framework = Framework> {
  context: DocsContextProps<TFramework>;
  theme?: ThemeVars;
  children?: ReactNode;
}

export const DocsContainer: FunctionComponent<DocsContainerProps> = ({
  context,
  theme,
  children,
}) => {
  useEffect(() => {
    let url;
    try {
      url = new URL(globalWindow.parent.location);
      if (url.hash) {
        const element = document.getElementById(url.hash.substring(1));
        if (element) {
          // Introducing a delay to ensure scrolling works when it's a full refresh.
          setTimeout(() => {
            scrollToElement(element);
          }, 200);
        }
      }
    } catch (err) {
      // pass
    }
  });

  return (
    <DocsContext.Provider value={context}>
      <SourceContainer channel={context.channel}>
        <ThemeProvider theme={ensureTheme(theme)}>
          <DocsWrapper className="sbdocs sbdocs-wrapper">
            <DocsContent className="sbdocs sbdocs-content">{children}</DocsContent>
          </DocsWrapper>
        </ThemeProvider>
      </SourceContainer>
    </DocsContext.Provider>
  );
};
