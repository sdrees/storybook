import path from 'path';
import fs from 'fs';
import { PluginOption } from 'vite';

export function readPackageJson(): Record<string, any> | false {
  const packageJsonPath = path.resolve('package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }

  const jsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  return JSON.parse(jsonContent);
}

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
