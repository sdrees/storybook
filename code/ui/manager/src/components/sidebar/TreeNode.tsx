import { styled } from '@storybook/theming';
import type { Color, Theme } from '@storybook/theming';
import { Icons } from '@storybook/components';
import { transparentize } from 'polished';
import type { FunctionComponent, ComponentProps } from 'react';
import React from 'react';

export const CollapseIcon = styled.span<{ isExpanded: boolean }>(({ theme, isExpanded }) => ({
  display: 'inline-block',
  width: 0,
  height: 0,
  marginTop: 6,
  marginLeft: 8,
  marginRight: 5,
  color: transparentize(0.4, theme.textMutedColor),
  borderTop: '3px solid transparent',
  borderBottom: '3px solid transparent',
  borderLeft: `3px solid`,
  transform: isExpanded ? 'rotateZ(90deg)' : 'none',
  transition: 'transform .1s ease-out',
}));

const iconColors = {
  light: {
    document: '#ff8300',
    docsModeDocument: 'secondary',
    bookmarkhollow: 'seafoam',
    component: 'secondary',
    folder: 'ultraviolet',
  },
  dark: {
    document: 'gold',
    docsModeDocument: 'secondary',
    bookmarkhollow: 'seafoam',
    component: 'secondary',
    folder: 'primary',
  },
};
const isColor = (theme: Theme, color: string): color is keyof Color => color in theme.color;
const TypeIcon = styled(Icons)<{ docsMode?: boolean }>(
  {
    width: 12,
    height: 12,
    padding: 1,
    marginTop: 3,
    marginRight: 5,
    flex: '0 0 auto',
  },

  // @ts-expect-error (TODO)
  ({ theme, icon, symbol = icon, docsMode }) => {
    const colors = theme.base === 'dark' ? iconColors.dark : iconColors.light;
    const colorKey = docsMode && symbol === 'document' ? 'docsModeDocument' : symbol;
    const color = colors[colorKey as keyof typeof colors];
    return { color: isColor(theme, color) ? theme.color[color] : color };
  }
);

const BranchNode = styled.button<{
  depth?: number;
  isExpandable?: boolean;
  isExpanded?: boolean;
  isComponent?: boolean;
  isSelected?: boolean;
}>(({ theme, depth = 0, isExpandable = false }) => ({
  width: '100%',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'start',
  textAlign: 'left',
  padding: 3,
  paddingLeft: `${(isExpandable ? 2 : 18) + depth * 16}px`,
  color: 'inherit',
  fontSize: `${theme.typography.size.s2 - 1}px`,
  background: 'transparent',
  '&:hover, &:focus': {
    background: theme.background.hoverable,
    outline: 'none',
  },
}));

const LeafNode = styled.a<{ depth?: number }>(({ theme, depth = 0 }) => ({
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'start',
  padding: 3,
  paddingLeft: `${18 + depth * 16}px`,
  fontSize: `${theme.typography.size.s2 - 1}px`,
  textDecoration: 'none',
  color: theme.color.defaultText,
  background: 'transparent',
  '&:hover, &:focus': {
    outline: 'none',
    background: theme.background.hoverable,
  },
  '&[data-selected="true"]': {
    color: theme.color.lightest,
    background: theme.color.secondary,
    fontWeight: theme.typography.weight.bold,
    '&:hover, &:focus': {
      background: theme.color.secondary,
    },
    svg: { color: theme.color.lightest },
  },
}));

export const Path = styled.span(({ theme }) => ({
  display: 'grid',
  justifyContent: 'start',
  gridAutoColumns: 'auto',
  gridAutoFlow: 'column',
  color: theme.textMutedColor,
  fontSize: `${theme.typography.size.s1 - 1}px`,
  '& > span': {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  '& > span + span': {
    position: 'relative',
    marginLeft: 4,
    paddingLeft: 7,
    '&:before': {
      content: "'/'",
      position: 'absolute',
      left: 0,
    },
  },
}));

export const RootNode = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 20px',
  marginTop: 16,
  marginBottom: 4,
  fontSize: `${theme.typography.size.s1 - 1}px`,
  fontWeight: theme.typography.weight.black,
  lineHeight: '16px',
  minHeight: 20,
  letterSpacing: '0.35em',
  textTransform: 'uppercase',
  color: theme.textMutedColor,
}));

export const GroupNode: FunctionComponent<
  ComponentProps<typeof BranchNode> & { isExpanded?: boolean; isExpandable?: boolean }
> = React.memo(function GroupNode({
  children,
  isExpanded = false,
  isExpandable = false,
  ...props
}) {
  return (
    <BranchNode isExpandable={isExpandable} tabIndex={-1} {...props}>
      {isExpandable ? <CollapseIcon isExpanded={isExpanded} /> : null}
      <TypeIcon icon="folder" useSymbol color="primary" />
      {children}
    </BranchNode>
  );
});

export const ComponentNode: FunctionComponent<ComponentProps<typeof BranchNode>> = React.memo(
  function ComponentNode({ theme, children, isExpanded, isExpandable, isSelected, ...props }) {
    return (
      <BranchNode isExpandable={isExpandable} tabIndex={-1} {...props}>
        {isExpandable && <CollapseIcon isExpanded={isExpanded} />}
        <TypeIcon icon="component" useSymbol color="secondary" />
        {children}
      </BranchNode>
    );
  }
);

export const DocumentNode: FunctionComponent<
  ComponentProps<typeof LeafNode> & { docsMode: boolean }
> = React.memo(function DocumentNode({ theme, children, docsMode, ...props }) {
  return (
    <LeafNode tabIndex={-1} {...props}>
      <TypeIcon icon="document" useSymbol docsMode={docsMode} />
      {children}
    </LeafNode>
  );
});

export const StoryNode: FunctionComponent<ComponentProps<typeof LeafNode>> = React.memo(
  function StoryNode({ theme, children, ...props }) {
    return (
      <LeafNode tabIndex={-1} {...props}>
        <TypeIcon icon="bookmarkhollow" useSymbol />
        {children}
      </LeafNode>
    );
  }
);
