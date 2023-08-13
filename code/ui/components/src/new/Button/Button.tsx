import React, { forwardRef } from 'react';
import { styled } from '@storybook/theming';
import { darken, lighten, rgba, transparentize } from 'polished';
import type { Icons } from '@storybook/icons';
import type { PropsOf } from '../utils/types';
import { Icon } from '../Icon/Icon';

interface ButtonProps<T extends React.ElementType = React.ElementType> {
  children: string;
  as?: T;
  size?: 'small' | 'medium';
  variant?: 'solid' | 'outline' | 'ghost';
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  icon?: Icons;
}

export const Button: {
  <E extends React.ElementType = 'button'>(
    props: ButtonProps<E> & Omit<PropsOf<E>, keyof ButtonProps>
  ): JSX.Element;
  displayName?: string;
} = forwardRef(
  ({ as, children, icon, ...props }: ButtonProps, ref: React.Ref<HTMLButtonElement>) => {
    const LocalIcon = Icon[icon];

    return (
      <StyledButton as={as} ref={ref} {...props}>
        {icon && <LocalIcon />}
        {children}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';

const StyledButton = styled.button<Omit<ButtonProps, 'children'>>(
  ({ theme, variant = 'solid', size = 'medium', disabled = false, active = false }) => ({
    border: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    gap: '6px',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: `${(() => {
      if (size === 'small') return '0 10px';
      if (size === 'medium') return '0 12px';
      return 0;
    })()}`,
    height: size === 'small' ? '28px' : '32px',
    position: 'relative',
    textAlign: 'center',
    textDecoration: 'none',
    transitionProperty: 'background, box-shadow',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease-out',
    verticalAlign: 'top',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    opacity: disabled ? 0.5 : 1,
    margin: 0,
    fontSize: `${theme.typography.size.s1}px`,
    fontWeight: theme.typography.weight.bold,
    lineHeight: '1',
    background: `${(() => {
      if (variant === 'solid') return theme.color.secondary;
      if (variant === 'outline') return theme.button.background;
      if (variant === 'ghost' && active) return theme.background.hoverable;
      return 'transparent';
    })()}`,
    color: `${(() => {
      if (variant === 'solid') return theme.color.lightest;
      if (variant === 'outline') return theme.input.color;
      if (variant === 'ghost' && active) return theme.color.secondary;
      if (variant === 'ghost') return theme.color.mediumdark;
      return theme.input.color;
    })()}`,
    boxShadow: variant === 'outline' ? `${theme.button.border} 0 0 0 1px inset` : 'none',
    borderRadius: theme.input.borderRadius,

    '&:hover': {
      color: variant === 'ghost' ? theme.color.secondary : null,
      background: `${(() => {
        let bgColor = theme.color.secondary;
        if (variant === 'solid') bgColor = theme.color.secondary;
        if (variant === 'outline') bgColor = theme.button.background;

        if (variant === 'ghost') return transparentize(0.86, theme.color.secondary);
        return theme.base === 'light' ? darken(0.02, bgColor) : lighten(0.03, bgColor);
      })()}`,
    },

    '&:active': {
      color: variant === 'ghost' ? theme.color.secondary : null,
      background: `${(() => {
        let bgColor = theme.color.secondary;
        if (variant === 'solid') bgColor = theme.color.secondary;
        if (variant === 'outline') bgColor = theme.button.background;

        if (variant === 'ghost') return theme.background.hoverable;
        return theme.base === 'light' ? darken(0.02, bgColor) : lighten(0.03, bgColor);
      })()}`,
    },

    '&:focus': {
      boxShadow: `${rgba(theme.color.secondary, 1)} 0 0 0 1px inset`,
      outline: 'none',
    },
  })
);
