import React, { forwardRef } from 'react';
import { styled } from '@storybook/theming';
import TextareaAutoResize from 'react-textarea-autosize';

interface TextareaProps {
  disabled?: boolean;
  placeholder?: string;
  value?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ ...props }, ref) => {
  return <StyledTextarea ref={ref} {...props} />;
});

Textarea.displayName = 'Textarea';

const StyledTextarea = styled(TextareaAutoResize)(({ theme }) => ({
  // resets
  appearance: 'none',
  border: '0 none',
  margin: ' 0',
  position: 'relative',

  // styles
  display: 'flex',
  alignItems: 'center',
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
  minHeight: 32,
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
