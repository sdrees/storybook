import vitePluginReact from '@vitejs/plugin-react';
import type { PluginOption } from 'vite';
import type { StorybookConfig } from '../../frameworks/react-vite/dist';

const config: StorybookConfig = {
  stories: [
    '../manager/src/**/*.stories.@(ts|tsx|js|jsx|mdx)',
    // '../../lib/components/src/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    // '../../../addons/interactions/**/*.stories.@(ts|tsx|js|jsx|mdx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: (config) => {
    return {
      ...config,
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [
          ...(config.optimizeDeps?.include ?? []),
          'react-element-to-jsx-string',
          'core-js/modules/es.regexp.flags.js',
          'react-colorful',
        ],
      },
      /*
      This might look complex but all we're doing is removing the default set of React Vite plugins
      and adding them back in, but with the `jsxRuntime: 'classic'` option.
      TODO: When we've upgraded to React 18 all of this shouldn't be necessary anymore
      */
      plugins: [...withoutReactPlugins(config.plugins), vitePluginReact({ jsxRuntime: 'classic' })],
    };
  },
};

// recursively remove all plugins from the React Vite plugin
const withoutReactPlugins = (plugins: PluginOption[] = []) =>
  plugins.map((plugin) => {
    if (Array.isArray(plugin)) {
      return withoutReactPlugins(plugin);
    }
    if (
      plugin &&
      'name' in plugin &&
      ['vite:react-jsx', 'vite:react-babel', 'vite:react-refresh'].includes(plugin.name)
    ) {
      return false;
    }
    return plugin;
  });

export default config;
