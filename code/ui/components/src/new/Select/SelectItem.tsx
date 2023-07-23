import * as RadixSelect from '@radix-ui/react-select';
import React, { forwardRef } from 'react';
import { styled } from '@storybook/theming';

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
}

const FakeIcon = styled.div(({ theme }) => ({
  width: 12,
  height: 12,
  backgroundColor: theme.color.mediumdark,
}));

export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ children, ...props }, forwardedRef) => {
    return (
      <StyledItem {...props} ref={forwardedRef}>
        <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
        <StyledItemIndicator className="SelectItemIndicator">
          <FakeIcon />
        </StyledItemIndicator>
      </StyledItem>
    );
  }
);

SelectItem.displayName = 'SelectItem';

const StyledItem = styled(RadixSelect.Item)(() => ({
  fontSize: '13px',
  lineHeight: 1,
  color: 'blue',
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
    backgroundColor: 'green',
    color: 'white',
  },
}));

const StyledItemIndicator = styled(RadixSelect.ItemIndicator)(() => ({
  position: 'absolute',
  left: 0,
  width: '25px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}));
