import { type StorybookConfig } from '@storybook/svelte-vite';
// @ts-expect-error -- TS picks up the type from preset.js instead of dist/preset.d.ts
import { viteFinal as svelteViteFinal } from '@storybook/svelte-vite/preset';
import { withoutVitePlugins } from '@storybook/builder-vite';

export const core: StorybookConfig['core'] = {
  builder: '@storybook/builder-vite',
  renderer: '@storybook/svelte',
};

export const viteFinal: NonNullable<StorybookConfig['viteFinal']> = async (config, options) => {
  const baseConfig = await svelteViteFinal(config, options);

  let { plugins = [] } = baseConfig;

  // Remove vite-plugin-svelte-kit from plugins if using SvelteKit
  // see https://github.com/storybookjs/storybook/issues/19280#issuecomment-1281204341
  plugins = await withoutVitePlugins(plugins, [
    // @sveltejs/kit@1.0.0-next.587 and later
    'vite-plugin-sveltekit-compile',
  ]);

  return { ...baseConfig, plugins };
};
