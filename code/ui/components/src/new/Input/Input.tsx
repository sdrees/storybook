import React, { forwardRef } from 'react';
import { styled } from '@storybook/theming';

interface InputProps {
  disabled?: boolean;
  placeholder?: string;
  value?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ ...props }, ref) => {
  return <StyledInput ref={ref} {...props} />;
});

Input.displayName = 'Input';

const StyledInput = styled.input(({ theme }) => ({
  // resets
  appearance: 'none',
  border: '0 none',
  display: 'block',
  margin: ' 0',
  position: 'relative',

  // styles
  width: '100%',
  height: '32px',
  transition: 'box-shadow 200ms ease-out, opacity 200ms ease-out',
  color: theme.input.color,
  background: theme.input.background,
  boxShadow: `${theme.input.border} 0 0 0 1px inset`,
  borderRadius: theme.input.borderRadius,
  fontSize: theme.typography.size.s2 - 1,
  padding: '6px 10px',
  boxSizing: 'border-box',
  lineHeight: '20px',

  '&:focus': {
    boxShadow: `${theme.color.secondary} 0 0 0 1px inset`,
    outline: 'none',
  },

  '&[disabled]': {
    cursor: 'not-allowed',
    opacity: 0.5,
  },

  '&:-webkit-autofill': {
    WebkitBoxShadow: `0 0 0 3em ${theme.color.lightest} inset`,
  },

  '&::placeholder': {
    color: theme.textMutedColor,
    opacity: 1,
  },
}));
