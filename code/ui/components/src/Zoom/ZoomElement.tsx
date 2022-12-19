/* global MutationObserver */
import type { ReactElement, RefObject } from 'react';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { styled } from '@storybook/theming';
import { browserSupportsCssZoom } from './browserSupportsCssZoom';

const hasBrowserSupportForCssZoom = browserSupportsCssZoom();

const ZoomElementWrapper = styled.div<{ scale: number; height: number }>(({ scale = 1, height }) =>
  hasBrowserSupportForCssZoom
    ? {
        '> *': {
          zoom: 1 / scale,
        },
      }
    : {
        height: height ? height + 50 : 'auto',
        transformOrigin: 'top left',
        transform: `scale(${1 / scale})`,
      }
);

const useMutationObserver = ({
  element,
  options = {},
  callback,
}: {
  element: RefObject<Element>;
  options: MutationObserverInit;
  callback: MutationCallback;
}): void => {
  const observer = useRef<MutationObserver>();

  useEffect(() => {
    if (!observer.current) {
      observer.current = new MutationObserver((mutationRecord, mutationObserver) => {
        callback(mutationRecord, mutationObserver);
      });
    }

    if (element?.current) {
      observer.current.observe(element.current, options);
    }

    return () => observer.current.disconnect();
  }, [element, observer, options]);
};

const mutationObserverOptions = { subtree: true, childList: true };

type ZoomProps = {
  scale: number;
  children: ReactElement | ReactElement[];
};

export function ZoomElement({ scale, children }: ZoomProps) {
  const componentWrapperRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const handleMutations = useCallback(() => {
    setHeight(componentWrapperRef.current.getBoundingClientRect().height);
  }, []);

  useEffect(() => {
    if (componentWrapperRef.current) {
      setHeight(componentWrapperRef.current.getBoundingClientRect().height);
    }
  }, [scale, componentWrapperRef.current]);

  useMutationObserver({
    element: componentWrapperRef,
    options: mutationObserverOptions,
    callback: handleMutations,
  });

  return (
    <ZoomElementWrapper scale={scale} height={height}>
      <div
        ref={hasBrowserSupportForCssZoom ? null : componentWrapperRef}
        className="innerZoomElementWrapper"
      >
        {children}
      </div>
    </ZoomElementWrapper>
  );
}
