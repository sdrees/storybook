import type { FC } from 'react';
import React from 'react';
import { styled } from '@storybook/theming';
import type { Step, TooltipRenderProps } from 'react-joyride';
import { Button } from '../../components/Button/Button';

const TooltipBody = styled.div`
  background: ${({ theme }) => {
    return theme.base === 'dark' ? '#292A2C' : theme.color.lightest;
  }};
  width: 260px;
  padding: 15px;
  border-radius: 5px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const TooltipTitle = styled.div`
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.color.defaultText};
`;

const TooltipContent = styled.p`
  font-size: 13px;
  line-height: 18px;
  text-align: start;
  color: ${({ theme }) => theme.color.defaultText};
  margin: 0;
  margin-top: 5px;
`;

const TooltipFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
`;

type TooltipProps = {
  step: Partial<
    Pick<
      // this only seems to happen during the check task, nos in vsCode..
      // this seems to be 'any' in vsCode because of it?
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore (hide property 'input' circularly references itself in mapped type)
      Step,
      | 'title'
      | 'content'
      | 'target'
      | 'placement'
      | 'disableOverlay'
      | 'disableBeacon'
      | 'floaterProps'
      | 'spotlightClicks'
      | 'styles'
    > & {
      hideNextButton: boolean;
      onNextButtonClick: () => void;
    }
  >;
  primaryProps: TooltipRenderProps['primaryProps'];
  tooltipProps: TooltipRenderProps['tooltipProps'];
};

export const Tooltip: FC<TooltipProps> = ({ step, primaryProps, tooltipProps }) => {
  return (
    <TooltipBody {...tooltipProps}>
      <Wrapper>
        {step.title && <TooltipTitle>{step.title}</TooltipTitle>}
        <TooltipContent>{step.content}</TooltipContent>
      </Wrapper>
      {!step.hideNextButton && (
        <TooltipFooter id="buttonNext">
          <Button
            {...{
              ...primaryProps,
              ...(step.onNextButtonClick ? { onClick: step.onNextButtonClick } : {}),
            }}
          >
            Next
          </Button>
        </TooltipFooter>
      )}
    </TooltipBody>
  );
};
