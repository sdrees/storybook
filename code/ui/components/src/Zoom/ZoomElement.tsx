import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import useResizeObserver from 'use-resize-observer';
import { styled } from '@storybook/theming';
import { browserSupportsCssZoom } from './browserSupportsCssZoom';

const hasBrowserSupportForCssZoom = browserSupportsCssZoom();

const ZoomElementWrapper = styled.div<{ scale: number; elementHeight: number }>(
  ({ scale = 1, elementHeight }) =>
    hasBrowserSupportForCssZoom
      ? {
          '> *': {
            zoom: 1 / scale,
          },
        }
      : {
          height: elementHeight || 'auto',
          transformOrigin: 'top left',
          transform: `scale(${1 / scale})`,
        }
);

type ZoomProps = {
  scale: number;
  children: ReactElement | ReactElement[];
};

export function ZoomElement({ scale, children }: ZoomProps) {
  const componentWrapperRef = useRef<HTMLDivElement>(null);
  const [elementHeight, setElementHeight] = useState(0);

  const onResize = useCallback(
    ({ height }) => {
      if (height) {
        setElementHeight(height / scale);
      }
    },
    [scale]
  );

  useEffect(() => {
    if (componentWrapperRef.current) {
      setElementHeight(componentWrapperRef.current.getBoundingClientRect().height);
    }
  }, [scale]);

  useResizeObserver({
    ref: componentWrapperRef,
    onResize,
  });

  return (
    <ZoomElementWrapper scale={scale} elementHeight={elementHeight}>
      <div
        ref={hasBrowserSupportForCssZoom ? null : componentWrapperRef}
        className="innerZoomElementWrapper"
      >
        {children}
      </div>
    </ZoomElementWrapper>
  );
}
