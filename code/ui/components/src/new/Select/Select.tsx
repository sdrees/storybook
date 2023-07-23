import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { styled } from '@storybook/theming';
import { ExpandAlt } from './icons/ExpandAlt';
import { Arrowup } from './icons/Arrowup';
import { Arrowdown } from './icons/Arrowdown';
import { Check } from './icons/Check';

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <StyledTrigger ref={ref} {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <ExpandAlt size={12} />
    </SelectPrimitive.Icon>
  </StyledTrigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <StyledContent ref={ref} {...props}>
      <StyledScrollUpButton>
        <Arrowup size={12} />
      </StyledScrollUpButton>
      <StyledViewport>{children}</StyledViewport>
      <StyledScrollDownButton>
        <Arrowdown size={12} />
      </StyledScrollDownButton>
    </StyledContent>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => <SelectPrimitive.Label ref={ref} {...props} />);
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <StyledItem ref={ref} {...props}>
    <StyledItemIndicator>
      <Check size={12} />
    </StyledItemIndicator>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </StyledItem>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => <SelectPrimitive.Separator ref={ref} {...props} />);
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export const Select = {
  Root: SelectPrimitive.Root,
  Group: SelectPrimitive.Group,
  Value: SelectPrimitive.Value,
  Trigger: SelectTrigger,
  Content: SelectContent,
  Label: SelectLabel,
  Item: SelectItem,
  Separator: SelectSeparator,
};

const StyledTrigger = styled(SelectPrimitive.Trigger)(({ theme }) => ({
  all: 'unset',
  display: 'flex',
  width: '100%',
  height: '32px',
  alignItems: 'center',
  justifyContent: 'space-between',
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

  '&[data-placeholder]': {
    color: theme.textMutedColor,
  },

  '&:-webkit-autofill': {
    WebkitBoxShadow: `0 0 0 3em ${theme.color.lightest} inset`,
  },
}));

const StyledContent = styled(SelectPrimitive.Content)(({ theme }) => ({
  boxSizing: 'border-box',
  overflow: 'hidden',
  backgroundColor: theme.input.background,
  borderRadius: '6px',
  border: theme.base === 'dark' ? `1px solid ${theme.input.border}` : '1px solid transparent',
  width: '100%',
  boxShadow:
    '0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)',
}));

const StyledViewport = styled(SelectPrimitive.Viewport)(() => ({
  boxSizing: 'border-box',
  width: '100%',
  padding: '5px',
}));

const StyledScrollUpButton = styled(SelectPrimitive.ScrollUpButton)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '25px',
  backgroundColor: theme.input.background,
  color: theme.input.color,
  cursor: 'default',
}));

const StyledScrollDownButton = styled(SelectPrimitive.ScrollDownButton)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '25px',
  backgroundColor: theme.input.background,
  color: theme.input.color,
  cursor: 'default',
}));

const StyledItem = styled(SelectPrimitive.Item)(({ theme }) => ({
  fontSize: '13px',
  lineHeight: 1,
  color: theme.input.color,
  borderRadius: '3px',
  display: 'flex',
  alignItems: 'center',
  height: '25px',
  padding: '0 35px 0 25px',
  position: 'relative',
  userSelect: 'none',

  '&[data-disabled]': {
    color: 'red',
    pointerEvents: 'none',
  },

  '&[data-highlighted]': {
    outline: 'none',
    backgroundColor: theme.barSelectedColor,
    color: theme.barBg,
  },
}));

const StyledItemIndicator = styled(SelectPrimitive.ItemIndicator)(() => ({
  position: 'absolute',
  left: 0,
  width: '25px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}));
