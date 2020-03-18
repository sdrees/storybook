import { document } from 'global';
import pick from 'lodash/pick';

import deprecate from 'util-deprecate';
import deepEqual from 'fast-deep-equal';

import { themes, ThemeVars } from '@storybook/theming';
import merge from '../lib/merge';
import { State } from '../index';
import Store from '../store';
import { Provider } from '../init-provider-api';

export type PanelPositions = 'bottom' | 'right';
export type ActiveTabsType = 'sidebar' | 'canvas' | 'addons';
export const ActiveTabs = {
  SIDEBAR: 'sidebar' as 'sidebar',
  CANVAS: 'canvas' as 'canvas',
  ADDONS: 'addons' as 'addons',
};

export interface Layout {
  initialActive: ActiveTabsType;
  isFullscreen: boolean;
  showPanel: boolean;
  panelPosition: PanelPositions;
  showNav: boolean;
  isToolshown: boolean;
}

export interface UI {
  name?: string;
  url?: string;
  enableShortcuts: boolean;
  sidebarAnimations: boolean;
  docsMode: boolean;
}

export interface SubState {
  layout: Layout;
  ui: UI;
  selectedPanel: string | undefined;
  theme: ThemeVars;
}

export interface SubAPI {
  toggleFullscreen: (toggled?: boolean) => void;
  togglePanel: (toggled?: boolean) => void;
  togglePanelPosition: (position?: PanelPositions) => void;
  toggleNav: (toggled?: boolean) => void;
  toggleToolbar: (toggled?: boolean) => void;
  setOptions: (options: any) => void;
}

type PartialSubState = Partial<SubState>;
type PartialThemeVars = Partial<ThemeVars>;
type PartialLayout = Partial<Layout>;

export interface UIOptions {
  name?: string;
  url?: string;
  goFullScreen: boolean;
  showStoriesPanel: boolean;
  showAddonPanel: boolean;
  addonPanelInRight: boolean;
  theme?: ThemeVars;
  selectedPanel?: string;
}

interface OptionsMap {
  [key: string]: string;
}

const deprecatedThemeOptions: {
  name: 'theme.brandTitle';
  url: 'theme.brandUrl';
} = {
  name: 'theme.brandTitle',
  url: 'theme.brandUrl',
};

const deprecatedLayoutOptions: {
  goFullScreen: 'isFullscreen';
  showStoriesPanel: 'showNav';
  showAddonPanel: 'showPanel';
  addonPanelInRight: 'panelPosition';
} = {
  goFullScreen: 'isFullscreen',
  showStoriesPanel: 'showNav',
  showAddonPanel: 'showPanel',
  addonPanelInRight: 'panelPosition',
};

const deprecationMessage = (optionsMap: OptionsMap, prefix = '') =>
  `The options { ${Object.keys(optionsMap).join(', ')} } are deprecated -- use ${
    prefix ? `${prefix}'s` : ''
  } { ${Object.values(optionsMap).join(', ')} } instead.`;

const applyDeprecatedThemeOptions = deprecate(
  ({ name, url, theme }: UIOptions): PartialThemeVars => {
    const { brandTitle, brandUrl, brandImage }: PartialThemeVars = theme || {};
    return {
      brandTitle: brandTitle || name,
      brandUrl: brandUrl || url,
      brandImage: brandImage || null,
    };
  },
  deprecationMessage(deprecatedThemeOptions)
);

const applyDeprecatedLayoutOptions = deprecate((options: Partial<UIOptions>): PartialLayout => {
  const layoutUpdate: PartialLayout = {};

  ['goFullScreen', 'showStoriesPanel', 'showAddonPanel'].forEach(
    (option: 'goFullScreen' | 'showStoriesPanel' | 'showAddonPanel') => {
      const v = options[option];
      if (typeof v !== 'undefined') {
        const key = deprecatedLayoutOptions[option];
        layoutUpdate[key] = v;
      }
    }
  );
  if (options.addonPanelInRight) {
    layoutUpdate.panelPosition = 'right';
  }
  return layoutUpdate;
}, deprecationMessage(deprecatedLayoutOptions));

const checkDeprecatedThemeOptions = (options: UIOptions) => {
  if (Object.keys(deprecatedThemeOptions).find(v => v in options)) {
    return applyDeprecatedThemeOptions(options);
  }
  return {};
};

const checkDeprecatedLayoutOptions = (options: Partial<UIOptions>) => {
  if (Object.keys(deprecatedLayoutOptions).find(v => v in options)) {
    return applyDeprecatedLayoutOptions(options);
  }
  return {};
};

const defaultState: SubState = {
  ui: {
    enableShortcuts: true,
    sidebarAnimations: true,
    docsMode: false,
  },
  layout: {
    initialActive: ActiveTabs.SIDEBAR,
    isToolshown: true,
    isFullscreen: false,
    showPanel: true,
    showNav: true,
    panelPosition: 'bottom',
  },
  selectedPanel: undefined,
  theme: themes.light,
};

export const focusableUIElements = {
  storySearchField: 'storybook-explorer-searchfield',
  storyListMenu: 'storybook-explorer-menu',
  storyPanelRoot: 'storybook-panel-root',
};

export default function({ store, provider }: { store: Store; provider: Provider }) {
  const api = {
    toggleFullscreen(toggled?: boolean) {
      return store.setState(
        (state: State) => {
          const value = typeof toggled === 'boolean' ? toggled : !state.layout.isFullscreen;

          return {
            layout: {
              ...state.layout,
              isFullscreen: value,
            },
          };
        },
        { persistence: 'session' }
      );
    },

    togglePanel(toggled?: boolean) {
      return store.setState(
        (state: State) => {
          const value = typeof toggled !== 'undefined' ? toggled : !state.layout.showPanel;

          return {
            layout: {
              ...state.layout,
              showPanel: value,
            },
          };
        },
        { persistence: 'session' }
      );
    },

    togglePanelPosition(position?: 'bottom' | 'right') {
      if (typeof position !== 'undefined') {
        return store.setState(
          (state: State) => ({
            layout: {
              ...state.layout,
              panelPosition: position,
            },
          }),
          { persistence: 'session' }
        );
      }

      return store.setState(
        (state: State) => ({
          layout: {
            ...state.layout,
            panelPosition: state.layout.panelPosition === 'right' ? 'bottom' : 'right',
          },
        }),
        { persistence: 'session' }
      );
    },

    toggleNav(toggled?: boolean) {
      return store.setState(
        (state: State) => {
          const value = typeof toggled !== 'undefined' ? toggled : !state.layout.showNav;

          return {
            layout: {
              ...state.layout,
              showNav: value,
            },
          };
        },
        { persistence: 'session' }
      );
    },

    toggleToolbar(toggled?: boolean) {
      return store.setState(
        (state: State) => {
          const value = typeof toggled !== 'undefined' ? toggled : !state.layout.isToolshown;

          return {
            layout: {
              ...state.layout,
              isToolshown: value,
            },
          };
        },
        { persistence: 'session' }
      );
    },

    resetLayout() {
      return store.setState(
        (state: State) => {
          return {
            layout: {
              ...state.layout,
              showNav: false,
              showPanel: false,
              isFullscreen: false,
            },
          };
        },
        { persistence: 'session' }
      );
    },

    focusOnUIElement(elementId?: string) {
      if (!elementId) {
        return;
      }
      const element = document.getElementById(elementId);
      if (element) {
        element.focus();
      }
    },

    getInitialOptions() {
      const { theme, selectedPanel, ...options } = provider.getConfig();

      return {
        ...defaultState,
        layout: {
          ...defaultState.layout,
          ...pick(options, Object.keys(defaultState.layout)),
          ...checkDeprecatedLayoutOptions(options),
        },
        ui: {
          ...defaultState.ui,
          ...pick(options, Object.keys(defaultState.ui)),
        },
        selectedPanel: selectedPanel || defaultState.selectedPanel,
        theme: theme || defaultState.theme,
      };
    },

    setOptions: (options: any) => {
      const { layout, ui, selectedPanel, theme } = store.getState();

      if (options) {
        const updatedLayout = {
          ...layout,
          ...pick(options, Object.keys(layout)),
          ...checkDeprecatedLayoutOptions(options),
        };

        const updatedUi = {
          ...ui,
          ...pick(options, Object.keys(ui)),
        };

        const updatedTheme = {
          ...theme,
          ...options.theme,
          ...checkDeprecatedThemeOptions(options),
        };

        const modification: PartialSubState = {};

        if (!deepEqual(ui, updatedUi)) {
          modification.ui = updatedUi;
        }
        if (!deepEqual(layout, updatedLayout)) {
          modification.layout = updatedLayout;
        }
        if (options.selectedPanel && !deepEqual(selectedPanel, options.selectedPanel)) {
          modification.selectedPanel = options.selectedPanel;
        }

        if (Object.keys(modification).length) {
          store.setState(modification, { persistence: 'permanent' });
        }
        if (!deepEqual(theme, updatedTheme)) {
          store.setState({ theme: updatedTheme });
        }
      }
    },
  };

  const persisted = pick(store.getState(), 'layout', 'ui', 'selectedPanel');

  return { api, state: merge(api.getInitialOptions(), persisted) };
}
