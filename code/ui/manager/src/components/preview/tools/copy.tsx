import { global } from '@storybook/global';
import React from 'react';
import copy from 'copy-to-clipboard';
import { getStoryHref, IconButton, Icons } from '@storybook/components';
import { Consumer, type Combo } from '@storybook/manager-api';
import type { Addon } from '@storybook/manager-api';

const { PREVIEW_URL, document } = global;

const copyMapper = ({ state }: Combo) => {
  const { storyId, refId, refs } = state;
  const { location } = document;
  const ref = refs[refId];
  let baseUrl = `${location.origin}${location.pathname}`;
  if (!baseUrl.endsWith('/')) baseUrl += '/';

  return {
    refId,
    baseUrl: ref ? `${ref.url}/iframe.html` : (PREVIEW_URL as string) || `${baseUrl}iframe.html`,
    storyId,
    queryParams: state.customQueryParams,
  };
};

export const copyTool: Addon = {
  title: 'copy',
  id: 'copy',
  match: ({ viewMode }) => viewMode === 'story',
  render: () => (
    <Consumer filter={copyMapper}>
      {({ baseUrl, storyId, queryParams }) =>
        storyId ? (
          <IconButton
            key="copy"
            onClick={() => copy(getStoryHref(baseUrl, storyId, queryParams))}
            title="Copy canvas link"
          >
            <Icons icon="link" />
          </IconButton>
        ) : null
      }
    </Consumer>
  ),
};
