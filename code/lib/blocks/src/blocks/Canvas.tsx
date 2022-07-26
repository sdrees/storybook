import React, { FC, ReactElement, ReactNode, ReactNodeArray, useContext } from 'react';
import { AnyFramework } from '@storybook/csf';
import {
  Preview as PurePreview,
  PreviewProps as PurePreviewProps,
  PreviewSkeleton,
} from '../components';
import { DocsContext, DocsContextProps } from './DocsContext';
import { SourceContext, SourceContextProps } from './SourceContainer';
import { getSourceProps, SourceState } from './Source';
import { useStories } from './useStory';
import { CURRENT_SELECTION, currentSelectionWarning } from './types';

export { SourceState };

type CanvasProps = PurePreviewProps & {
  withSource?: SourceState;
  mdxSource?: string;
};

const getPreviewProps = (
  { withSource, mdxSource, children, ...props }: CanvasProps & { children?: ReactNode },
  docsContext: DocsContextProps<AnyFramework>,
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
    if (targetId === CURRENT_SELECTION) currentSelectionWarning();
    return targetId === CURRENT_SELECTION ? docsContext.storyById().id : targetId;
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
