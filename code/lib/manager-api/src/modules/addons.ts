import type { Addon_Types, API_Collection, API_Panels, API_StateMerger } from '@storybook/types';
import { Addon_TypesEnum } from '@storybook/types';
import type { ModuleFn } from '../index';
import type { Options } from '../store';

export interface SubState {
  selectedPanel: string;
  addons: Record<string, never>;
}

export interface SubAPI {
  getElements: <T>(type: Addon_Types) => API_Collection<T>;
  getPanels: () => API_Panels;
  getStoryPanels: () => API_Panels;
  getSelectedPanel: () => string;
  setSelectedPanel: (panelName: string) => void;
  setAddonState<S>(
    addonId: string,
    newStateOrMerger: S | API_StateMerger<S>,
    options?: Options
  ): Promise<S>;
  getAddonState<S>(addonId: string): S;
}

export function ensurePanel(panels: API_Panels, selectedPanel?: string, currentPanel?: string) {
  const keys = Object.keys(panels);

  if (keys.indexOf(selectedPanel) >= 0) {
    return selectedPanel;
  }

  if (keys.length) {
    return keys[0];
  }
  return currentPanel;
}

export const init: ModuleFn<SubAPI, SubState> = ({ provider, store, fullAPI }) => {
  const api: SubAPI = {
    getElements: (type) => provider.getElements(type),
    getPanels: () => api.getElements(Addon_TypesEnum.PANEL),
    getStoryPanels: () => {
      const allPanels = api.getPanels();
      const { storyId } = store.getState();
      const story = fullAPI.getData(storyId);

      if (!allPanels || !story || story.type !== 'story') {
        return allPanels;
      }

      const { parameters } = story;

      const filteredPanels: API_Collection = {};
      Object.entries(allPanels).forEach(([id, panel]) => {
        const { paramKey } = panel;
        if (paramKey && parameters && parameters[paramKey] && parameters[paramKey].disable) {
          return;
        }
        filteredPanels[id] = panel;
      });

      return filteredPanels;
    },
    getSelectedPanel: () => {
      const { selectedPanel } = store.getState();
      return ensurePanel(api.getPanels(), selectedPanel, selectedPanel);
    },
    setSelectedPanel: (panelName) => {
      store.setState({ selectedPanel: panelName }, { persistence: 'session' });
    },
    setAddonState<S>(
      addonId: string,
      newStateOrMerger: S | API_StateMerger<S>,
      options?: Options
    ): Promise<S> {
      let nextState;
      const { addons: existing } = store.getState();
      if (typeof newStateOrMerger === 'function') {
        const merger = newStateOrMerger as API_StateMerger<S>;
        nextState = merger(api.getAddonState<S>(addonId));
      } else {
        nextState = newStateOrMerger;
      }
      return store
        .setState({ addons: { ...existing, [addonId]: nextState } }, options)
        .then(() => api.getAddonState(addonId));
    },
    getAddonState: (addonId) => {
      return store.getState().addons[addonId];
    },
  };

  return {
    api,
    state: {
      selectedPanel: ensurePanel(api.getPanels(), store.getState().selectedPanel),
      addons: {},
    },
  };
};
