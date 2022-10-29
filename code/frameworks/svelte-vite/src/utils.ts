import type { PluginOption } from 'vite';

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
