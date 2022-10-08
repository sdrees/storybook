import type { StorybookConfig } from '@storybook/builder-vite';
import { hasPlugin } from './utils';
import { svelteDocgen } from './plugins/svelte-docgen';

export const addons: StorybookConfig['addons'] = ['@storybook/svelte'];

export const core: StorybookConfig['core'] = {
  builder: '@storybook/builder-vite',
};

export const viteFinal: StorybookConfig['viteFinal'] = async (config, options) => {
  const { plugins = [] } = config;
  const { svelte, loadSvelteConfig } = await import('@sveltejs/vite-plugin-svelte');
  const svelteOptions: Record<string, any> = await options.presets.apply(
    'svelteOptions',
    {},
    options
  );
  const svelteConfig = { ...(await loadSvelteConfig()), ...svelteOptions };

  // Add svelte plugin if not present
  if (!hasPlugin(plugins, 'vite-plugin-svelte')) {
    plugins.push(svelte());
  }

  // Add docgen plugin
  plugins.push(svelteDocgen(svelteConfig));

  // TODO: temporary until/unless https://github.com/storybookjs/addon-svelte-csf/issues/64 is fixed
  // Wrapping in try-catch in case `@storybook/addon-svelte-csf is not installed
  try {
    const { default: svelteCsfPlugin } = await import('./plugins/csf-plugin');
    plugins.push(svelteCsfPlugin(svelteConfig));
  } catch (err) {
    // Not all projects use `.stories.svelte` for stories, and by default 6.5+ does not auto-install @storybook/addon-svelte-csf.
    // If it's any other kind of error, re-throw.
    if ((err as NodeJS.ErrnoException).code !== 'MODULE_NOT_FOUND') {
      throw err;
    }
  }

  return {
    ...config,
    plugins,
  };
};
