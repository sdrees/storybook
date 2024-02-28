import { css, styled } from '@storybook/theming';
import * as Dialog from '@radix-ui/react-dialog';
import React from 'react';

export const StyledOverlay = styled.div`
  background-color: rgba(27, 28, 29, 0.48);
  position: fixed;
  inset: 0px;
  width: 100%;
  height: 100%;
  z-index: 10;
`;

export const StyledContent = styled.div<{
  width: number;
  height: number;
}>(
  ({ width, height }) => css`
    background-color: white;
    border-radius: 6px;
    box-shadow: rgba(14, 18, 22, 0.35) 0px 10px 38px -10px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: ${width ?? 740}px;
    height: ${height ? `${height}px` : 'auto'};
    max-width: calc(100% - 40px);
    max-height: 85vh;
    overflow: hidden;
    z-index: 11;

    &:focus-visible {
      outline: none;
    }
  `
);

export const ContentWrapper = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof StyledContent> & React.ComponentProps<typeof Dialog.Content>
>(function ContentWrapper({ width, height, children, ...contentProps }, ref) {
  return (
    <Dialog.Content ref={ref} asChild {...contentProps}>
      <StyledContent width={width} height={height}>
        {children}
      </StyledContent>
    </Dialog.Content>
  );
});
