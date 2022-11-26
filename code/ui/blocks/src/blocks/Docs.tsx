import React from 'react';
import type { FunctionComponent, ComponentType } from 'react';
import type { Renderer, Parameters } from '@storybook/types';
import type { Theme } from '@storybook/theming';

import type { DocsContextProps } from './DocsContext';
import { DocsContainer } from './DocsContainer';
import { DocsPage } from './DocsPage';

export type DocsProps<TFramework extends Renderer = Renderer> = {
  docsParameter: Parameters;
  context: DocsContextProps<TFramework>;
};

export const Docs: FunctionComponent<DocsProps> = ({ docsParameter, context }) => {
  const Container: ComponentType<{ context: DocsContextProps; theme: Theme }> =
    docsParameter.container || DocsContainer;

  const Page = docsParameter.page || DocsPage;

  return (
    <Container context={context} theme={docsParameter.theme}>
      <Page />
    </Container>
  );
};
