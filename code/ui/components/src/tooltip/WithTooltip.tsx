import type { FC, ReactNode } from 'react';
import React, { useCallback, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { styled } from '@storybook/theming';
import { global } from '@storybook/global';

import type { TriggerType } from 'react-popper-tooltip';
import { usePopperTooltip } from 'react-popper-tooltip';
import type { Modifier, Placement } from '@popperjs/core';
import { Tooltip } from './Tooltip';

const { document } = global;

// A target that doesn't speak popper
const TargetContainer = styled.div<{ mode: string }>`
  display: inline-block;
  cursor: ${(props) => (props.mode === 'hover' ? 'default' : 'pointer')};
`;

const TargetSvgContainer = styled.g<{ mode: string }>`
  cursor: ${(props) => (props.mode === 'hover' ? 'default' : 'pointer')};
`;

interface WithHideFn {
  onHide: () => void;
}

export interface WithTooltipPureProps {
  svg?: boolean;
  trigger?: TriggerType;
  closeOnClick?: boolean;
  placement?: Placement;
  modifiers?: Array<Partial<Modifier<string, {}>>>;
  hasChrome?: boolean;
  tooltip: ReactNode | ((p: WithHideFn) => ReactNode);
  children: ReactNode;
  tooltipShown?: boolean;
  onVisibilityChange?: (visibility: boolean) => void | boolean;
  onDoubleClick?: () => void;
}

// Pure, does not bind to the body
const WithTooltipPure: FC<WithTooltipPureProps> = ({
  svg,
  trigger,
  closeOnClick,
  placement,
  modifiers,
  hasChrome,
  tooltip,
  children,
  tooltipShown,
  onVisibilityChange,
  ...props
}) => {
  const Container = svg ? TargetSvgContainer : TargetContainer;
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible, state } =
    usePopperTooltip(
      {
        trigger,
        placement,
        defaultVisible: tooltipShown,
        closeOnOutsideClick: closeOnClick,
        onVisibleChange: onVisibilityChange,
      },
      {
        modifiers,
      }
    );

  return (
    <>
      <Container mode={trigger} ref={setTriggerRef as any} {...props}>
        {children}
      </Container>
      {visible &&
        ReactDOM.createPortal(
          <Tooltip
            placement={state?.placement}
            ref={setTooltipRef}
            hasChrome={hasChrome}
            arrowProps={getArrowProps()}
            {...getTooltipProps()}
          >
            {typeof tooltip === 'function'
              ? tooltip({ onHide: () => onVisibilityChange(false) })
              : tooltip}
          </Tooltip>,
          document.body
        )}
    </>
  );
};

WithTooltipPure.defaultProps = {
  svg: false,
  trigger: 'hover',
  closeOnClick: false,
  placement: 'top',
  modifiers: [
    {
      name: 'preventOverflow',
      options: {
        padding: 8,
      },
    },
    {
      name: 'offset',
      options: {
        offset: [8, 8],
      },
    },
    {
      name: 'arrow',
      options: {
        padding: 8,
      },
    },
  ],
  hasChrome: true,
  tooltipShown: false,
};

const WithToolTipState: FC<
  WithTooltipPureProps & {
    startOpen?: boolean;
  }
> = ({ startOpen = false, onVisibilityChange: onChange, ...rest }) => {
  const [tooltipShown, setTooltipShown] = useState(startOpen);
  const onVisibilityChange: (visibility: boolean) => void = useCallback(
    (visibility) => {
      if (onChange && onChange(visibility) === false) return;
      setTooltipShown(visibility);
    },
    [onChange]
  );

  useEffect(() => {
    const hide = () => onVisibilityChange(false);
    document.addEventListener('keydown', hide, false);

    // Find all iframes on the screen and bind to clicks inside them (waiting until the iframe is ready)
    const iframes: HTMLIFrameElement[] = Array.from(document.getElementsByTagName('iframe'));
    const unbinders: (() => void)[] = [];
    iframes.forEach((iframe) => {
      const bind = () => {
        try {
          if (iframe.contentWindow.document) {
            iframe.contentWindow.document.addEventListener('click', hide);
            unbinders.push(() => {
              try {
                iframe.contentWindow.document.removeEventListener('click', hide);
              } catch (e) {
                // logger.debug('Removing a click listener from iframe failed: ', e);
              }
            });
          }
        } catch (e) {
          // logger.debug('Adding a click listener to iframe failed: ', e);
        }
      };

      bind(); // I don't know how to find out if it's already loaded so I potentially will bind twice
      iframe.addEventListener('load', bind);
      unbinders.push(() => {
        iframe.removeEventListener('load', bind);
      });
    });

    return () => {
      document.removeEventListener('keydown', hide);
      unbinders.forEach((unbind) => {
        unbind();
      });
    };
  });

  return (
    <WithTooltipPure
      {...rest}
      tooltipShown={tooltipShown}
      onVisibilityChange={onVisibilityChange}
    />
  );
};

export { WithTooltipPure, WithToolTipState, WithToolTipState as WithTooltip };
