/* eslint-disable @typescript-eslint/naming-convention */
import { global } from '@storybook/global';
import { PREVIEW_KEYDOWN } from '@storybook/core-events';

import type { ModuleFn } from '../index';

import type { KeyboardEventLike } from '../lib/shortcut';
import { shortcutMatchesShortcut, eventToShortcut } from '../lib/shortcut';
import { focusableUIElements } from './layout';

const { navigator, document } = global;

export const isMacLike = () =>
  navigator && navigator.platform ? !!navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) : false;
export const controlOrMetaKey = () => (isMacLike() ? 'meta' : 'control');

export function keys<O>(o: O) {
  return Object.keys(o) as (keyof O)[];
}

export interface SubState {
  shortcuts: API_Shortcuts;
}

export interface SubAPI {
  getShortcutKeys(): API_Shortcuts;
  getDefaultShortcuts(): API_Shortcuts | API_AddonShortcutDefaults;
  getAddonsShortcuts(): API_AddonShortcuts;
  getAddonsShortcutLabels(): API_AddonShortcutLabels;
  getAddonsShortcutDefaults(): API_AddonShortcutDefaults;
  setShortcuts(shortcuts: API_Shortcuts): Promise<API_Shortcuts>;
  setShortcut(action: API_Action, value: API_KeyCollection): Promise<API_KeyCollection>;
  setAddonShortcut(addon: string, shortcut: API_AddonShortcut): Promise<API_AddonShortcut>;
  restoreAllDefaultShortcuts(): Promise<API_Shortcuts>;
  restoreDefaultShortcut(action: API_Action): Promise<API_KeyCollection>;
  handleKeydownEvent(event: KeyboardEventLike): void;
  handleShortcutFeature(feature: API_Action): void;
}
export type API_KeyCollection = string[];

export interface API_Shortcuts {
  fullScreen: API_KeyCollection;
  togglePanel: API_KeyCollection;
  panelPosition: API_KeyCollection;
  toggleNav: API_KeyCollection;
  toolbar: API_KeyCollection;
  search: API_KeyCollection;
  focusNav: API_KeyCollection;
  focusIframe: API_KeyCollection;
  focusPanel: API_KeyCollection;
  prevComponent: API_KeyCollection;
  nextComponent: API_KeyCollection;
  prevStory: API_KeyCollection;
  nextStory: API_KeyCollection;
  shortcutsPage: API_KeyCollection;
  aboutPage: API_KeyCollection;
  escape: API_KeyCollection;
  collapseAll: API_KeyCollection;
  expandAll: API_KeyCollection;
}

export type API_Action = keyof API_Shortcuts;

interface API_AddonShortcut {
  label: string;
  defaultShortcut: API_KeyCollection;
  actionName: string;
  showInMenu?: boolean;
  action: (...args: any[]) => any;
}
type API_AddonShortcuts = Record<string, API_AddonShortcut>;
type API_AddonShortcutLabels = Record<string, string>;
type API_AddonShortcutDefaults = Record<string, API_KeyCollection>;

export const defaultShortcuts: API_Shortcuts = Object.freeze({
  fullScreen: ['F'],
  togglePanel: ['A'],
  panelPosition: ['D'],
  toggleNav: ['S'],
  toolbar: ['T'],
  search: ['/'],
  focusNav: ['1'],
  focusIframe: ['2'],
  focusPanel: ['3'],
  prevComponent: ['alt', 'ArrowUp'],
  nextComponent: ['alt', 'ArrowDown'],
  prevStory: ['alt', 'ArrowLeft'],
  nextStory: ['alt', 'ArrowRight'],
  shortcutsPage: [controlOrMetaKey(), 'shift', ','],
  aboutPage: [','],
  escape: ['escape'], // This one is not customizable
  collapseAll: [controlOrMetaKey(), 'shift', 'ArrowUp'],
  expandAll: [controlOrMetaKey(), 'shift', 'ArrowDown'],
});

const addonsShortcuts: API_AddonShortcuts = {};

function focusInInput(event: KeyboardEvent) {
  const target = event.target as Element;
  return /input|textarea/i.test(target.tagName) || target.getAttribute('contenteditable') !== null;
}

export const init: ModuleFn = ({ store, fullAPI }) => {
  const api: SubAPI = {
    // Getting and setting shortcuts
    getShortcutKeys(): API_Shortcuts {
      return store.getState().shortcuts;
    },
    getDefaultShortcuts(): API_Shortcuts | API_AddonShortcutDefaults {
      return {
        ...defaultShortcuts,
        ...api.getAddonsShortcutDefaults(),
      };
    },
    getAddonsShortcuts(): API_AddonShortcuts {
      return addonsShortcuts;
    },
    getAddonsShortcutLabels(): API_AddonShortcutLabels {
      const labels: API_AddonShortcutLabels = {};
      Object.entries(api.getAddonsShortcuts()).forEach(([actionName, { label }]) => {
        labels[actionName] = label;
      });

      return labels;
    },
    getAddonsShortcutDefaults(): API_AddonShortcutDefaults {
      const defaults: API_AddonShortcutDefaults = {};
      Object.entries(api.getAddonsShortcuts()).forEach(([actionName, { defaultShortcut }]) => {
        defaults[actionName] = defaultShortcut;
      });

      return defaults;
    },
    async setShortcuts(shortcuts: API_Shortcuts) {
      await store.setState({ shortcuts }, { persistence: 'permanent' });
      return shortcuts;
    },
    async restoreAllDefaultShortcuts() {
      return api.setShortcuts(api.getDefaultShortcuts() as API_Shortcuts);
    },
    async setShortcut(action, value) {
      const shortcuts = api.getShortcutKeys();
      await api.setShortcuts({ ...shortcuts, [action]: value });
      return value;
    },
    async setAddonShortcut(addon: string, shortcut: API_AddonShortcut) {
      const shortcuts = api.getShortcutKeys();
      await api.setShortcuts({
        ...shortcuts,
        [`${addon}-${shortcut.actionName}`]: shortcut.defaultShortcut,
      });
      addonsShortcuts[`${addon}-${shortcut.actionName}`] = shortcut;
      return shortcut;
    },
    async restoreDefaultShortcut(action) {
      const defaultShortcut = api.getDefaultShortcuts()[action];
      return api.setShortcut(action, defaultShortcut);
    },

    // Listening to shortcut events
    handleKeydownEvent(event) {
      const shortcut = eventToShortcut(event);
      const shortcuts = api.getShortcutKeys();
      const actions = keys(shortcuts);
      const matchedFeature = actions.find((feature: API_Action) =>
        shortcutMatchesShortcut(shortcut, shortcuts[feature])
      );
      if (matchedFeature) {
        // Event.prototype.preventDefault is missing when received from the MessageChannel.
        if (event?.preventDefault) event.preventDefault();
        api.handleShortcutFeature(matchedFeature);
      }
    },

    // warning: event might not have a full prototype chain because it may originate from the channel
    handleShortcutFeature(feature) {
      const {
        layout: { isFullscreen, showNav, showPanel },
        ui: { enableShortcuts },
      } = store.getState();
      if (!enableShortcuts) {
        return;
      }
      switch (feature) {
        case 'escape': {
          if (isFullscreen) {
            fullAPI.toggleFullscreen();
          } else if (!showNav) {
            fullAPI.toggleNav();
          }
          break;
        }

        case 'focusNav': {
          if (isFullscreen) {
            fullAPI.toggleFullscreen();
          }
          if (!showNav) {
            fullAPI.toggleNav();
          }
          fullAPI.focusOnUIElement(focusableUIElements.storyListMenu);
          break;
        }

        case 'search': {
          if (isFullscreen) {
            fullAPI.toggleFullscreen();
          }
          if (!showNav) {
            fullAPI.toggleNav();
          }

          setTimeout(() => {
            fullAPI.focusOnUIElement(focusableUIElements.storySearchField, true);
          }, 0);
          break;
        }

        case 'focusIframe': {
          const element = document.getElementById('storybook-preview-iframe') as HTMLIFrameElement;

          if (element) {
            try {
              // should be like a channel message and all that, but yolo for now
              element.contentWindow.focus();
            } catch (e) {
              //
            }
          }
          break;
        }

        case 'focusPanel': {
          if (isFullscreen) {
            fullAPI.toggleFullscreen();
          }
          if (!showPanel) {
            fullAPI.togglePanel();
          }
          fullAPI.focusOnUIElement(focusableUIElements.storyPanelRoot);
          break;
        }

        case 'nextStory': {
          fullAPI.jumpToStory(1);
          break;
        }

        case 'prevStory': {
          fullAPI.jumpToStory(-1);
          break;
        }

        case 'nextComponent': {
          fullAPI.jumpToComponent(1);
          break;
        }

        case 'prevComponent': {
          fullAPI.jumpToComponent(-1);
          break;
        }

        case 'fullScreen': {
          fullAPI.toggleFullscreen();
          break;
        }

        case 'togglePanel': {
          if (isFullscreen) {
            fullAPI.toggleFullscreen();
            fullAPI.resetLayout();
          }

          fullAPI.togglePanel();
          break;
        }

        case 'toggleNav': {
          if (isFullscreen) {
            fullAPI.toggleFullscreen();
            fullAPI.resetLayout();
          }

          fullAPI.toggleNav();
          break;
        }

        case 'toolbar': {
          fullAPI.toggleToolbar();
          break;
        }

        case 'panelPosition': {
          if (isFullscreen) {
            fullAPI.toggleFullscreen();
          }
          if (!showPanel) {
            fullAPI.togglePanel();
          }

          fullAPI.togglePanelPosition();
          break;
        }

        case 'aboutPage': {
          fullAPI.navigate('/settings/about');
          break;
        }

        case 'shortcutsPage': {
          fullAPI.navigate('/settings/shortcuts');
          break;
        }
        case 'collapseAll': {
          fullAPI.collapseAll();
          break;
        }
        case 'expandAll': {
          fullAPI.expandAll();
          break;
        }
        default:
          addonsShortcuts[feature].action();
          break;
      }
    },
  };

  const { shortcuts: persistedShortcuts = defaultShortcuts }: SubState = store.getState();
  const state: SubState = {
    // Any saved shortcuts that are still in our set of defaults
    shortcuts: keys(defaultShortcuts).reduce(
      (acc, key) => ({ ...acc, [key]: persistedShortcuts[key] || defaultShortcuts[key] }),
      defaultShortcuts
    ),
  };

  const initModule = () => {
    // Listen for keydown events in the manager
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (!focusInInput(event)) {
        fullAPI.handleKeydownEvent(event);
      }
    });

    // Also listen to keydown events sent over the channel
    fullAPI.on(PREVIEW_KEYDOWN, (data: { event: KeyboardEventLike }) => {
      fullAPI.handleKeydownEvent(data.event);
    });
  };

  return { api, state, init: initModule };
};
