/* eslint-disable no-param-reassign */
import { STORIES_COLLAPSE_ALL, STORIES_EXPAND_ALL } from '@storybook/core-events';
import type { Listener } from '@storybook/channels';

import type { API_Provider } from '@storybook/types';
import type { API, ModuleFn } from '../index';

export interface SubAPI {
  getChannel: () => API_Provider<API>['channel'];
  on: (type: string, cb: Listener) => () => void;
  off: (type: string, cb: Listener) => void;
  emit: (type: string, ...args: any[]) => void;
  once: (type: string, cb: Listener) => void;
  collapseAll: () => void;
  expandAll: () => void;
}

export type SubState = Record<string, never>;

export const init: ModuleFn<SubAPI, SubState> = ({ provider }) => {
  const api: SubAPI = {
    getChannel: () => provider.channel,
    on: (type, cb) => {
      provider.channel.addListener(type, cb);

      return () => provider.channel.removeListener(type, cb);
    },
    off: (type, cb) => provider.channel.removeListener(type, cb),
    once: (type, cb) => provider.channel.once(type, cb),
    emit: (type, data, ...args) => {
      if (
        data?.options?.target &&
        data.options.target !== 'storybook-preview-iframe' &&
        !data.options.target.startsWith('storybook-ref-')
      ) {
        data.options.target =
          data.options.target !== 'storybook_internal'
            ? `storybook-ref-${data.options.target}`
            : 'storybook-preview-iframe';
      }
      provider.channel.emit(type, data, ...args);
    },

    collapseAll: () => {
      provider.channel.emit(STORIES_COLLAPSE_ALL, {});
    },
    expandAll: () => {
      api.emit(STORIES_EXPAND_ALL);
    },
  };
  return { api, state: {} };
};
