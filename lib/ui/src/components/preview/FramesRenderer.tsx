import React, { Fragment, FunctionComponent, useMemo, useEffect, useState } from 'react';
import { Global, CSSObject } from '@storybook/theming';
import { IFrame } from './iframe';
import { FramesRendererProps } from './utils/types';
import { stringifyQueryParams } from './utils/stringifyQueryParams';

const getActive = (
  refId: FramesRendererProps['refId'],
  storyId: FramesRendererProps['storyId']
) => {
  if (storyId === '*') {
    return undefined;
  }

  if (refId) {
    return `storybook-ref-${refId}`;
  }

  return 'storybook-preview-iframe';
};

export const FramesRenderer: FunctionComponent<FramesRendererProps> = ({
  refs,
  story,
  scale,
  viewMode,
  refId,
  queryParams,
  baseUrl,
  storyId,
}) => {
  const stringifiedQueryParams = stringifyQueryParams(queryParams);
  const active = getActive(refId, storyId);

  const styles = useMemo<CSSObject>(() => {
    return {
      '[data-is-storybook="false"]': {
        visibility: 'hidden',
      },
      '[data-is-storybook="true"]': {
        visibility: 'visible',
      },
    };
  }, [refs]);

  const [frames, setFrames] = useState<Record<string, string>>({
    'storybook-preview-iframe': `${baseUrl}?id=${storyId}&viewMode=${viewMode}${stringifiedQueryParams}`,
  });

  useEffect(() => {
    const newFrames = Object.values(refs)
      .filter((r) => {
        if (r.startInjected) {
          return true;
        }
        if (story && r.id === story.refId) {
          return true;
        }

        return false;
      })
      .reduce((acc, r) => {
        return {
          ...acc,
          [`storybook-ref-${r.id}`]: `${r.url}/iframe.html?id=${storyId}&viewMode=${viewMode}${stringifiedQueryParams}`,
        };
      }, frames);

    setFrames(newFrames);
  }, [storyId, story, refs]);

  return (
    <Fragment>
      <Global styles={styles} />
      {Object.entries(frames).map(([id, src]) => (
        <Fragment key={id}>
          <IFrame
            active={id === active}
            key={refs[id] ? refs[id].url : id}
            id={id}
            title={id}
            src={src}
            allowFullScreen
            scale={scale}
          />
        </Fragment>
      ))}
    </Fragment>
  );
};
