// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./typings.d.ts" />

import type { ElementType } from 'react';
import { createElement, forwardRef } from 'react';
import * as typography from './legacy/typography/components';

export { A } from './legacy/typography/elements/A';
export { Blockquote } from './legacy/typography/elements/Blockquote';
export { Code } from './legacy/typography/elements/Code';
export { Div } from './legacy/typography/elements/Div';
export { DL } from './legacy/typography/elements/DL';
export { H1 } from './legacy/typography/elements/H1';
export { H2 } from './legacy/typography/elements/H2';
export { H3 } from './legacy/typography/elements/H3';
export { H4 } from './legacy/typography/elements/H4';
export { H5 } from './legacy/typography/elements/H5';
export { H6 } from './legacy/typography/elements/H6';
export { HR } from './legacy/typography/elements/HR';
export { Img } from './legacy/typography/elements/Img';
export { LI } from './legacy/typography/elements/LI';
export { OL } from './legacy/typography/elements/OL';
export { P } from './legacy/typography/elements/P';
export { Pre } from './legacy/typography/elements/Pre';
export { Span } from './legacy/typography/elements/Span';
export { Table } from './legacy/typography/elements/Table';
export { TT } from './legacy/typography/elements/TT';
export { UL } from './legacy/typography/elements/UL';
export { Badge } from './legacy/Badge/Badge';

// Typography
export { Link } from './legacy/typography/link/link';
export { DocumentWrapper } from './legacy/typography/DocumentWrapper';
export type {
  SyntaxHighlighterFormatTypes,
  SyntaxHighlighterProps,
  SyntaxHighlighterRendererProps,
} from './legacy/syntaxhighlighter/syntaxhighlighter-types';
export { SyntaxHighlighter } from './legacy/syntaxhighlighter/lazy-syntaxhighlighter';
export { createCopyToClipboardFunction } from './legacy/syntaxhighlighter/syntaxhighlighter';

// UI
export { ActionBar } from './legacy/ActionBar/ActionBar';
export { Spaced } from './legacy/spaced/Spaced';
export { Placeholder } from './legacy/placeholder/placeholder';
export { ScrollArea } from './legacy/ScrollArea/ScrollArea';
export { Zoom } from './legacy/Zoom/Zoom';
export type { ActionItem } from './legacy/ActionBar/ActionBar';
export { ErrorFormatter } from './legacy/ErrorFormatter/ErrorFormatter';

// Forms
export { Button } from './legacy/Button/Button';
export { Form } from './legacy/form/index';

// Tooltips
export { WithTooltip, WithTooltipPure } from './legacy/tooltip/lazy-WithTooltip';
export { TooltipMessage } from './legacy/tooltip/TooltipMessage';
export { TooltipNote } from './legacy/tooltip/TooltipNote';
export {
  TooltipLinkList,
  type Link as TooltipLinkListLink,
} from './legacy/tooltip/TooltipLinkList';
export { default as ListItem } from './legacy/tooltip/ListItem';

// Toolbar and subcomponents
export { Tabs, TabsState, TabBar, TabWrapper } from './legacy/tabs/tabs';
export { IconButton, IconButtonSkeleton, TabButton } from './legacy/bar/button';
export { Separator, interleaveSeparators } from './legacy/bar/separator';
export { Bar, FlexBar } from './legacy/bar/bar';
export { AddonPanel } from './legacy/addon-panel/addon-panel';

// Graphics
export type { IconsProps } from './legacy/icon/icon';
export { Icons, Symbols } from './legacy/icon/icon';
export { icons } from './legacy/icon/icons';
export { StorybookLogo } from './legacy/brand/StorybookLogo';
export { StorybookIcon } from './legacy/brand/StorybookIcon';

// Loader
export { Loader } from './legacy/Loader/Loader';

// Utils
export { getStoryHref } from './legacy/utils/getStoryHref';

export * from './legacy/typography/DocumentFormatting';
export * from './legacy/typography/ResetWrapper';

export { withReset, codeCommon } from './legacy/typography/lib/common';

export { ClipboardCode } from './legacy/clipboard/ClipboardCode';

// eslint-disable-next-line prefer-destructuring
export const components = typography.components;

const resetComponents: Record<string, ElementType> = {};

Object.keys(typography.components).forEach((key) => {
  // eslint-disable-next-line react/display-name
  resetComponents[key] = forwardRef((props, ref) => createElement(key, { ...props, ref }));
});

export { resetComponents };
