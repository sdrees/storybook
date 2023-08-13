import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import React, { forwardRef } from 'react';
import * as ToolbarPrimitive from '@radix-ui/react-toolbar';
import { styled } from '@storybook/theming';

interface RootProps extends ComponentPropsWithoutRef<typeof ToolbarPrimitive.Root> {
  hasPadding?: boolean;
  borderBottom?: boolean;
  borderTop?: boolean;
}

const ToolbarRoot = forwardRef<ElementRef<typeof ToolbarPrimitive.Root>, RootProps>(
  ({ className, children, ...props }, ref) => (
    <StyledRoot ref={ref} {...props}>
      {children}
    </StyledRoot>
  )
);
ToolbarRoot.displayName = ToolbarPrimitive.Root.displayName;

const ToolbarSeparator = React.forwardRef<
  ElementRef<typeof ToolbarPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof ToolbarPrimitive.Separator>
>(({ className, ...props }, ref) => <StyledSeparator ref={ref} {...props} />);
ToolbarSeparator.displayName = ToolbarPrimitive.Separator.displayName;

const ToolbarToggleGroup = React.forwardRef<
  ElementRef<typeof ToolbarPrimitive.ToggleGroup>,
  ToolbarPrimitive.ToolbarToggleGroupSingleProps | ToolbarPrimitive.ToolbarToggleGroupMultipleProps
>(({ className, ...props }, ref) => <StyledToggleGroup ref={ref} {...props} />);
ToolbarToggleGroup.displayName = ToolbarPrimitive.ToggleGroup.displayName;

const ToolbarToggleItem = React.forwardRef<
  ElementRef<typeof ToolbarPrimitive.ToggleItem>,
  ComponentPropsWithoutRef<typeof ToolbarPrimitive.ToggleItem>
>(({ className, ...props }, ref) => <ToolbarPrimitive.ToggleItem ref={ref} {...props} asChild />);
ToolbarToggleItem.displayName = ToolbarPrimitive.ToggleItem.displayName;

const StyledRoot = styled(ToolbarPrimitive.Root)<RootProps>(
  ({ theme, hasPadding = true, borderBottom = true, borderTop = false }) => ({
    display: 'flex',
    padding: hasPadding ? '0 10px' : 0,
    justifyContent: 'space-between',
    height: 40,
    borderBottom: borderBottom ? `1px solid ${theme.appBorderColor}` : 'none',
    borderTop: borderTop ? `1px solid ${theme.appBorderColor}` : 'none',
    boxSizing: 'border-box',
    backgroundColor: theme.barBg,
  })
);

const StyledSeparator = styled(ToolbarPrimitive.Separator)(({ theme }) => ({
  width: 1,
  height: 20,
  backgroundColor: theme.appBorderColor,
}));

const StyledToggleGroup = styled(ToolbarPrimitive.ToggleGroup)({
  display: 'flex',
  gap: 5,
  alignItems: 'center',
});

const Left = styled.div({
  display: 'flex',
  gap: 5,
  alignItems: 'center',
});

const Right = styled.div({
  display: 'flex',
  gap: 5,
  alignItems: 'center',
});

export const Toolbar = {
  Root: ToolbarRoot,
  Left,
  Right,
  ToogleGroup: ToolbarToggleGroup,
  ToggleItem: ToolbarToggleItem,
  Separator: ToolbarSeparator,
};
