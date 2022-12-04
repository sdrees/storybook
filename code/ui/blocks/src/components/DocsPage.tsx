import { withReset } from '@storybook/components';
import type { CSSObject } from '@storybook/theming';
import { styled } from '@storybook/theming';
import { transparentize } from 'polished';
import type { FC } from 'react';
import React from 'react';

/**
 * This selector styles all raw elements inside the DocsPage like this example with a `<div/>`:
 * :where(div:not(.sb-unstyled, .sbdocs-preview... :where(.sb-unstyled, .sbdocs-preview...) div))
 *
 * 1. first ':where': ensures this has a specificity of 0, making it easy to override.
 * 2. 'div:not(...)': selects all div elements that are not...
 * 3. '.sb-unstyled, .sbdocs-preview...': any of the elements we don't want to style
 * 3. ':where(.sb-unstyled, .sbdocs-preview...) div': or are descendants of an .sb-unstyled or .sbdocs-preview, etc. It is a shorthand for '.sb-unstyled div, sbdocs-preview div...'
 * 4. .sb-unstyled is an escape hatch that allows the user to opt-out of the default styles
 *    by wrapping their content in an element with this class: <Unstyled />
 * 5. the other UNSTYLED_SELECTORS are elements we don't want the styles to bleed into, like canvas, story and source blocks.
 */
const UNSTYLED_SELECTORS = [
  '.sb-unstyled',
  '.sbdocs-preview',
  '.sbdocs-pre',
  '.sb-story',
  '.docblock-source',
  '.sb-anchor',
].join(', ');
const toGlobalSelector = (element: string): string =>
  `& :where(${element}:not(${UNSTYLED_SELECTORS}, :where(${UNSTYLED_SELECTORS}) ${element}))`;

const breakpoint = 600;

export interface DocsPageProps {
  title: string;
  subtitle?: string;
}

export const Title = styled.h1(withReset, ({ theme }) => ({
  color: theme.color.defaultText,
  fontSize: theme.typography.size.m3,
  fontWeight: theme.typography.weight.black,
  lineHeight: '32px',

  [`@media (min-width: ${breakpoint}px)`]: {
    fontSize: theme.typography.size.l1,
    lineHeight: '36px',
    marginBottom: '.5rem', // 8px
  },
}));

export const Subtitle = styled.h2(withReset, ({ theme }) => ({
  fontWeight: theme.typography.weight.regular,
  fontSize: theme.typography.size.s3,
  lineHeight: '20px',
  borderBottom: 'none',
  marginBottom: 15,

  [`@media (min-width: ${breakpoint}px)`]: {
    fontSize: theme.typography.size.m1,
    lineHeight: '28px',
    marginBottom: 24,
  },

  color: transparentize(0.25, theme.color.defaultText),
}));

export const DocsContent = styled.div(({ theme }) => {
  const reset = {
    fontFamily: theme.typography.fonts.base,
    fontSize: theme.typography.size.s3,
    margin: 0,

    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
    WebkitOverflowScrolling: 'touch' as CSSObject['WebkitOverflowScrolling'],
  };
  const headers = {
    margin: '20px 0 8px',
    padding: 0,
    cursor: 'text',
    position: 'relative',
    color: theme.color.defaultText,
    '&:first-of-type': {
      marginTop: 0,
      paddingTop: 0,
    },
    '&:hover a.anchor': {
      textDecoration: 'none',
    },
    '& code': {
      fontSize: 'inherit',
    },
  };
  const code = {
    lineHeight: 1,
    margin: '0 2px',
    padding: '3px 5px',
    whiteSpace: 'nowrap',

    borderRadius: 3,
    fontSize: theme.typography.size.s2 - 1,

    border:
      theme.base === 'light'
        ? `1px solid ${theme.color.mediumlight}`
        : `1px solid ${theme.color.darker}`,
    color:
      theme.base === 'light'
        ? transparentize(0.1, theme.color.defaultText)
        : transparentize(0.3, theme.color.defaultText),
    backgroundColor: theme.base === 'light' ? theme.color.lighter : theme.color.border,
  };

  return {
    maxWidth: 1000,
    width: '100%',

    ...reset,
    [toGlobalSelector('a')]: {
      ...reset,
      fontSize: 'inherit',
      lineHeight: '24px',

      color: theme.color.secondary,
      textDecoration: 'none',
      '&.absent': {
        color: '#cc0000',
      },
      '&.anchor': {
        display: 'block',
        paddingLeft: 30,
        marginLeft: -30,
        cursor: 'pointer',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
      },
    },
    [toGlobalSelector('blockquote')]: {
      ...reset,
      margin: '16px 0',
      borderLeft: `4px solid ${theme.color.medium}`,
      padding: '0 15px',
      color: theme.color.dark,
      '& > :first-of-type': {
        marginTop: 0,
      },
      '& > :last-child': {
        marginBottom: 0,
      },
    },
    [toGlobalSelector('div')]: reset,
    [toGlobalSelector('dl')]: {
      ...reset,
      margin: '16px 0',
      padding: 0,
      '& dt': {
        fontSize: '14px',
        fontWeight: 'bold',
        fontStyle: 'italic',
        padding: 0,
        margin: '16px 0 4px',
      },
      '& dt:first-of-type': {
        padding: 0,
      },
      '& dt > :first-of-type': {
        marginTop: 0,
      },

      '& dt > :last-child': {
        marginBottom: 0,
      },

      '& dd': {
        margin: '0 0 16px',
        padding: '0 15px',
      },

      '& dd > :first-of-type': {
        marginTop: 0,
      },

      '& dd > :last-child': {
        marginBottom: 0,
      },
    },
    [toGlobalSelector('h1')]: {
      ...reset,
      ...headers,
      fontSize: `${theme.typography.size.l1}px`,
      fontWeight: theme.typography.weight.black,
    },
    [toGlobalSelector('h2')]: {
      ...reset,
      ...headers,
      fontSize: `${theme.typography.size.m2}px`,
      paddingBottom: 4,
      borderBottom: `1px solid ${theme.appBorderColor}`,
    },
    [toGlobalSelector('h3')]: {
      ...reset,
      ...headers,
      fontSize: `${theme.typography.size.m1}px`,
    },
    [toGlobalSelector('h4')]: {
      ...reset,
      ...headers,
      fontSize: `${theme.typography.size.s3}px`,
    },
    [toGlobalSelector('h5')]: {
      ...reset,
      ...headers,
      fontSize: `${theme.typography.size.s2}px`,
    },
    [toGlobalSelector('h6')]: {
      ...reset,
      ...headers,
      fontSize: `${theme.typography.size.s2}px`,
      color: theme.color.dark,
    },
    [toGlobalSelector('hr')]: {
      border: '0 none',
      borderTop: `1px solid ${theme.appBorderColor}`,
      height: 4,
      padding: 0,
    },
    [toGlobalSelector('img')]: {
      maxWidth: '100%',
    },
    [toGlobalSelector('li')]: {
      ...reset,
      fontSize: theme.typography.size.s2,
      color: theme.color.defaultText,
      lineHeight: '24px',
      '& + li': {
        marginTop: '.25em',
      },
      '& ul, & ol': {
        marginTop: '.25em',
        marginBottom: 0,
      },
      '& code': code,
    },
    [toGlobalSelector('ol')]: {
      ...reset,
      margin: '16px 0',
      paddingLeft: 30,
      '& :first-of-type': {
        marginTop: 0,
      },
      '& :last-child': {
        marginBottom: 0,
      },
    },
    [toGlobalSelector('p')]: {
      ...reset,
      margin: '16px 0',
      fontSize: theme.typography.size.s2,
      lineHeight: '24px',
      color: theme.color.defaultText,
      '& code': code,
    },
    [toGlobalSelector('pre')]: {
      ...reset,
      // reset
      fontFamily: theme.typography.fonts.mono,
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      lineHeight: '18px',
      padding: '11px 1rem',
      whiteSpace: 'pre-wrap',
      color: 'inherit',
      borderRadius: 3,
      margin: '1rem 0',

      '&:not(.prismjs)': {
        background: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: 0,
        margin: 0,
      },
      '& pre, &.prismjs': {
        padding: 15,
        margin: 0,
        whiteSpace: 'pre-wrap',
        color: 'inherit',
        fontSize: '13px',
        lineHeight: '19px',
        code: {
          color: 'inherit',
          fontSize: 'inherit',
        },
      },
      '& code': {
        whiteSpace: 'pre',
      },
      '& code, & tt': {
        border: 'none',
      },
    },
    [toGlobalSelector('span')]: {
      ...reset,
      '&.frame': {
        display: 'block',
        overflow: 'hidden',

        '& > span': {
          border: `1px solid ${theme.color.medium}`,
          display: 'block',
          float: 'left',
          overflow: 'hidden',
          margin: '13px 0 0',
          padding: 7,
          width: 'auto',
        },
        '& span img': {
          display: 'block',
          float: 'left',
        },
        '& span span': {
          clear: 'both',
          color: theme.color.darkest,
          display: 'block',
          padding: '5px 0 0',
        },
      },
      '&.align-center': {
        display: 'block',
        overflow: 'hidden',
        clear: 'both',

        '& > span': {
          display: 'block',
          overflow: 'hidden',
          margin: '13px auto 0',
          textAlign: 'center',
        },
        '& span img': {
          margin: '0 auto',
          textAlign: 'center',
        },
      },
      '&.align-right': {
        display: 'block',
        overflow: 'hidden',
        clear: 'both',

        '& > span': {
          display: 'block',
          overflow: 'hidden',
          margin: '13px 0 0',
          textAlign: 'right',
        },
        '& span img': {
          margin: 0,
          textAlign: 'right',
        },
      },
      '&.float-left': {
        display: 'block',
        marginRight: 13,
        overflow: 'hidden',
        float: 'left',
        '& span': {
          margin: '13px 0 0',
        },
      },
      '&.float-right': {
        display: 'block',
        marginLeft: 13,
        overflow: 'hidden',
        float: 'right',

        '& > span': {
          display: 'block',
          overflow: 'hidden',
          margin: '13px auto 0',
          textAlign: 'right',
        },
      },
    },
    [toGlobalSelector('table')]: {
      ...reset,
      margin: '16px 0',
      fontSize: theme.typography.size.s2,
      lineHeight: '24px',
      padding: 0,
      borderCollapse: 'collapse',
      '& tr': {
        borderTop: `1px solid ${theme.appBorderColor}`,
        backgroundColor: theme.appContentBg,
        margin: 0,
        padding: 0,
      },
      '& tr:nth-of-type(2n)': {
        backgroundColor: theme.base === 'dark' ? theme.color.darker : theme.color.lighter,
      },
      '& tr th': {
        fontWeight: 'bold',
        color: theme.color.defaultText,
        border: `1px solid ${theme.appBorderColor}`,
        margin: 0,
        padding: '6px 13px',
      },
      '& tr td': {
        border: `1px solid ${theme.appBorderColor}`,
        color: theme.color.defaultText,
        margin: 0,
        padding: '6px 13px',
      },
      '& tr th :first-of-type, & tr td :first-of-type': {
        marginTop: 0,
      },
      '& tr th :last-child, & tr td :last-child': {
        marginBottom: 0,
      },
    },
    [toGlobalSelector('ul')]: {
      ...reset,
      margin: '16px 0',
      paddingLeft: 30,
      '& :first-of-type': {
        marginTop: 0,
      },
      '& :last-child': {
        marginBottom: 0,
      },
      listStyle: 'disc',
    },
  };
});

export const DocsWrapper = styled.div(({ theme }) => ({
  background: theme.background.content,
  display: 'flex',
  justifyContent: 'center',
  padding: '4rem 20px',
  minHeight: '100vh',
  boxSizing: 'border-box',

  [`@media (min-width: ${breakpoint}px)`]: {},
}));

interface DocsPageWrapperProps {
  children?: React.ReactNode;
}

export const DocsPageWrapper: FC<DocsPageWrapperProps> = ({ children }) => (
  <DocsWrapper>
    <DocsContent>{children}</DocsContent>
  </DocsWrapper>
);
