import type { MouseEvent } from 'react';
import React, { forwardRef } from 'react';
import { styled } from '@storybook/theming';
import type { Icons } from '@storybook/icons';
import { Icon } from '../Icon/Icon';
import type { PropsOf } from '../utils/types';

export interface LinkProps<T extends React.ElementType = React.ElementType> {
  as?: T;
  children: string;
  variant?: 'primary' | 'secondary';
  weight?: 'regular' | 'bold';
  underline?: 'hover' | 'always';
  icon?: Icons;
  onClick?: (e: MouseEvent) => void;
  withArrow?: boolean;
}

export const Link: {
  <E extends React.ElementType = 'a'>(
    props: LinkProps<E> & Omit<PropsOf<E>, keyof LinkProps>
  ): JSX.Element;
  displayName?: string;
} = forwardRef(
  ({ children, icon, withArrow, ...props }: LinkProps, ref: React.Ref<HTMLAnchorElement>) => {
    const LocalIcon = Icon[icon];
    return (
      <StyledLink ref={ref} {...props}>
        <StyledLeft>
          {icon && <LocalIcon />}
          {children}
        </StyledLeft>
        {withArrow && <Icon.ChevronRight size={8} />}
      </StyledLink>
    );
  }
);

Link.displayName = 'Link';

const StyledLink = styled.a<Omit<LinkProps, 'children'>>(
  ({ theme, variant = 'primary', underline = 'hover', weight = 'regular' }) => ({
    display: 'inline-flex',
    gap: 4,
    alignItems: 'center',
    transition: 'all 150ms ease-out',
    textDecoration: 'none',
    lineHeight: 1,
    color: `${(() => {
      if (variant === 'primary') return theme.color.secondary;
      if (variant === 'secondary') return theme.color.defaultText;
      return theme.color.secondary;
    })()}`,
    fontWeight: `${(() => {
      if (weight === 'regular') return theme.typography.weight.regular;
      if (weight === 'bold') return theme.typography.weight.bold;
      return theme.typography.weight.bold;
    })()}`,
    textDecorationLine: `${underline === 'always' ? 'underline' : 'none'}`,
    textDecorationStyle: 'solid',
    textDecorationThickness: '1px',
    textUnderlineOffset: '2px',

    '&:hover, &:focus': {
      cursor: 'pointer',
      textDecorationLine: 'underline',
    },
  })
);

const StyledLeft = styled.span(({ theme }) => ({
  display: 'inline-flex',
  gap: 6,
  alignItems: 'center',
  fontSize: theme.typography.size.s2 - 1,
}));
