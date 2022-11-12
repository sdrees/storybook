import React from 'react';

import { ThemeProvider, themes, ensure } from '@storybook/theming';
import type { Framework } from '@storybook/types';

import { DocsContext } from '../DocsContext';
import { ExternalPreview } from './ExternalPreview';

let preview: ExternalPreview<Framework>;

export const ExternalDocsContainer: React.FC<{ projectAnnotations: any }> = ({
  projectAnnotations,
  children,
}) => {
  if (!preview) preview = new ExternalPreview(projectAnnotations);

  return (
    <DocsContext.Provider value={preview.docsContext()}>
      <ThemeProvider theme={ensure(themes.light)}>{children}</ThemeProvider>
    </DocsContext.Provider>
  );
};
