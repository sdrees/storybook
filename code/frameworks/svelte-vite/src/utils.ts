import type { PluginOption } from 'vite';
import { deprecate } from '@storybook/node-logger';
import { withoutVitePlugins } from '@storybook/builder-vite';
import type { Options } from '@storybook/types';

function checkName(plugin: PluginOption, name: string) {
  return typeof plugin === 'object' && 'name' in plugin && plugin.name === name;
}

export function hasPlugin(plugins: PluginOption[], name: string) {
  return Boolean(
    plugins.find((p): boolean => {
      if (Array.isArray(p)) {
        return Boolean(hasPlugin(p, name));
      }
      return checkName(p, name);
    })
  );
}

/**
 * A migration step that ensures the svelte-vite framework still supports SvelteKit,
 * but warns the user that they should use the sveltekit framework instead.
 * Should be removed when we decide to remove support completely for SvelteKit in svelte-vite
 */
export async function handleSvelteKit(
  plugins: PluginOption[],
  options: Options
): Promise<PluginOption[]> {
  if (!hasPlugin(plugins, 'vite-plugin-svelte-kit')) {
    // this is not a SvelteKit project ✅
    return plugins;
  }

  /*
  the sveltekit framework uses this svelte-vite framework under the hood
  so we have to take extra care of only warning when the user is actually using
  svelte-vite directly and not just through sveltekit
  */

  const frameworkPreset = await options.presets.apply('framework', {}, options);
  const framework = typeof frameworkPreset === 'string' ? frameworkPreset : frameworkPreset.name;

  if (framework === '@storybook/sveltekit') {
    // this uses @storybook/sveltekit, so everything is fine ✅
    return plugins;
  }

  // this is a SvelteKit project but doesn't use @storybook/sveltekit, warn user about this and remove vite-plugin-svelte-kit ❌
  deprecate(
    'SvelteKit support in @storybook/svelte-vite is deprecated in Storybook 7.0, use @storybook/sveltekit instead.'
  );
  return withoutVitePlugins(plugins, ['vite-plugin-svelte-kit']);
}
