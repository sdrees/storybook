import type { API_IframeRenderer } from '@storybook/types';
import type { ModuleFn } from '../index';

export interface SubAPI {
  renderPreview?: API_IframeRenderer;
}

export const init: ModuleFn<SubAPI, {}, true> = ({ provider, fullAPI }) => {
  return {
    api: provider.renderPreview ? { renderPreview: provider.renderPreview } : {},
    state: {},
    init: () => {
      provider.handleAPI(fullAPI);
    },
  };
};
