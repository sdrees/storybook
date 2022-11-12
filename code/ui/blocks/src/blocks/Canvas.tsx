import type { FC, ReactElement, ReactNode, ReactNodeArray } from 'react';
import React, { useContext } from 'react';
import type { Framework } from '@storybook/types';
import type { PreviewProps as PurePreviewProps } from '../components';
import { Preview as PurePreview, PreviewSkeleton } from '../components';
import type { DocsContextProps } from './DocsContext';
import { DocsContext } from './DocsContext';
import type { SourceContextProps } from './SourceContainer';
import { SourceContext } from './SourceContainer';
import { getSourceProps, SourceState } from './Source';
import { useStories } from './useStory';

export { SourceState };

type CanvasProps = PurePreviewProps & {
  withSource?: SourceState;
  mdxSource?: string;
};

const getPreviewProps = (
  { withSource, mdxSource, children, ...props }: CanvasProps & { children?: ReactNode },
  docsContext: DocsContextProps<Framework>,
  sourceContext: SourceContextProps
) => {
  let sourceState = withSource;
  let isLoading = false;
  if (sourceState === SourceState.NONE) {
    return { isLoading, previewProps: props };
  }
  if (mdxSource) {
    return {
      isLoading,
      previewProps: {
        ...props,
        withSource: getSourceProps({ code: decodeURI(mdxSource) }, docsContext, sourceContext),
        isExpanded: sourceState === SourceState.OPEN,
      },
    };
  }
  const childArray: ReactNodeArray = Array.isArray(children) ? children : [children];
  const storyChildren = childArray.filter(
    (c: ReactElement) => c.props && (c.props.id || c.props.name || c.props.of)
  ) as ReactElement[];
  const targetIds = storyChildren.map(({ props: { id, of, name } }) => {
    if (id) return id;
    if (of) return docsContext.storyIdByModuleExport(of);

    return docsContext.storyIdByName(name);
  });

  const sourceProps = getSourceProps({ ids: targetIds }, docsContext, sourceContext);
  if (!sourceState) sourceState = sourceProps.state;
  const storyIds = targetIds.map((targetId) => {
    return targetId;
  });

  const stories = useStories(storyIds, docsContext);
  isLoading = stories.some((s) => !s);

  return {
    isLoading,
    previewProps: {
      ...props, // pass through columns etc.
      withSource: sourceProps,
      isExpanded: sourceState === SourceState.OPEN,
    },
  };
};

export const Canvas: FC<CanvasProps> = (props) => {
  const docsContext = useContext(DocsContext);
  const sourceContext = useContext(SourceContext);
  const { isLoading, previewProps } = getPreviewProps(props, docsContext, sourceContext);
  const { children } = props;

  if (isLoading) return <PreviewSkeleton />;

  return <PurePreview {...previewProps}>{children}</PurePreview>;
};
