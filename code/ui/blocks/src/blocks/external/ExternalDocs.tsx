import type { FunctionComponent } from 'react';
import React, { useRef } from 'react';
import type { Renderer, ProjectAnnotations } from '@storybook/types';
import { composeConfigs } from '@storybook/preview-api';

import { Docs } from '../Docs';
import { ExternalPreview } from './ExternalPreview';

export type ExternalDocsProps<TFramework extends Renderer = Renderer> = {
  projectAnnotationsList: ProjectAnnotations<TFramework>[];
};

function usePreview<TFramework extends Renderer = Renderer>(
  projectAnnotations: ProjectAnnotations<TFramework>
) {
  const previewRef = useRef<ExternalPreview>();
  if (!previewRef.current) previewRef.current = new ExternalPreview(projectAnnotations);
  return previewRef.current;
}

export const ExternalDocs: FunctionComponent<ExternalDocsProps> = ({
  projectAnnotationsList,
  children,
}) => {
  const projectAnnotations = composeConfigs(projectAnnotationsList);
  const preview = usePreview(projectAnnotations);
  const docsParameter = {
    ...projectAnnotations.parameters?.docs,
    page: () => children,
  };

  return <Docs docsParameter={docsParameter} context={preview.docsContext()} />;
};
