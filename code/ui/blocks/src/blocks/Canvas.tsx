import React, { Children, useContext } from 'react';
import type { FC, ReactElement, ReactNode } from 'react';
import type { Renderer } from '@storybook/types';
import type { PreviewProps as PurePreviewProps } from '../components';
import { Preview as PurePreview, PreviewSkeleton } from '../components';
import type { DocsContextProps } from './DocsContext';
import { DocsContext } from './DocsContext';
import type { SourceContextProps } from './SourceContainer';
import { SourceContext } from './SourceContainer';
import { useSourceProps, SourceState } from './Source';
import { useStories } from './useStory';
import { getStoryId } from './Story';

export { SourceState };

type CanvasProps = Omit<PurePreviewProps, 'isExpanded' | 'isLoading'> & {
  withSource?: SourceState;
  mdxSource?: string;
  children?: ReactNode;
};

const usePreviewProps = (
  { withSource, mdxSource, children, ...props }: CanvasProps,
  docsContext: DocsContextProps<Renderer>,
  sourceContext: SourceContextProps
) => {
  /*
  get all story IDs by traversing through the children,
  filter out any non-story children (e.g. text nodes)
  and then get the id from each story depending on available props
  */
  const storyIds = (Children.toArray(children) as ReactElement[])
    .filter((c) => c.props && (c.props.id || c.props.name || c.props.of))
    .map((c) => getStoryId(c.props, docsContext));

  const stories = useStories(storyIds, docsContext);
  const isLoading = stories.some((s) => !s);
  const sourceProps = useSourceProps(
    mdxSource ? { code: decodeURI(mdxSource) } : { ids: storyIds },
    docsContext,
    sourceContext
  );
  if (withSource === SourceState.NONE) {
    return { isLoading, previewProps: props };
  }

  return {
    isLoading,
    previewProps: {
      ...props, // pass through columns etc.
      withSource: sourceProps,
      isExpanded: (withSource || sourceProps.state) === SourceState.OPEN,
    },
  };
};

export const Canvas: FC<CanvasProps> = (props) => {
  const docsContext = useContext(DocsContext);
  const sourceContext = useContext(SourceContext);
  const { isLoading, previewProps } = usePreviewProps(props, docsContext, sourceContext);
  const { children } = props;

  if (isLoading) return <PreviewSkeleton />;

  return <PurePreview {...previewProps}>{children}</PurePreview>;
};
