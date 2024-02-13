import { dedent } from 'ts-dedent';
import type { Fix } from '../types';
import findUp from 'find-up';
import { getFrameworkPackageName } from '../helpers/mainConfigFile';
import { frameworkToRenderer } from '../../helpers';
import { frameworkPackages } from '@storybook/core-common';

interface Webpack5RunOptions {
  plugins: string[];
  existed: boolean;
}

export const viteConfigFile = {
  id: 'viteConfigFile',

  async check({ mainConfig, packageManager }) {
    const viteConfigPath = await findUp([
      'vite.config.js',
      'vite.config.mjs',
      'vite.config.cjs',
      'vite.config.ts',
    ]);

    const rendererToVitePluginMap: Record<string, string> = {
      preact: '@preact/preset-vite',
      qwik: 'vite-plugin-qwik',
      react: '@vitejs/plugin-react',
      solid: 'vite-plugin-solid',
      svelte: '@sveltejs/vite-plugin-svelte',
      sveltekit: '@sveltejs/kit/vite', // might be pointless?
      vue: '@vitejs/plugin-vue',
    };

    const frameworkPackageName = getFrameworkPackageName(mainConfig);
    if (!frameworkPackageName) {
      return null;
    }
    const frameworkName = frameworkPackages[frameworkPackageName];
    const isUsingViteBuilder =
      mainConfig.core?.builder === 'vite' ||
      frameworkPackageName?.includes('vite') ||
      frameworkPackageName === 'qwik' ||
      frameworkPackageName === 'solid' ||
      frameworkPackageName === 'sveltekit';

    const rendererName = frameworkToRenderer[frameworkName as keyof typeof frameworkToRenderer];

    if (!viteConfigPath && isUsingViteBuilder) {
      const plugins = [];

      if (rendererToVitePluginMap[rendererName]) {
        plugins.push(rendererToVitePluginMap[rendererName]);
      }

      return {
        plugins,
        existed: !!viteConfigPath,
      };
    }

    const plugin = rendererToVitePluginMap[rendererName];

    if (!plugin) {
      return null;
    }

    const pluginVersion = await packageManager.getPackageVersion(plugin);

    if (viteConfigPath && isUsingViteBuilder && !pluginVersion) {
      const plugins = [];

      if (plugin) {
        plugins.push(plugin);
      }

      return {
        plugins,
        existed: !viteConfigPath,
      };
    }

    return null;
  },

  prompt({ existed, plugins }) {
    if (existed) {
      return dedent`
        Storybook 8.0.0 no longer ships with a Vite config build-in.
        We've detected you do have a Vite config, but you may be missing the following plugins in it.

        ${plugins.map((plugin) => `  - ${plugin}`).join('\n')}

        If you do already have these plugins, you can ignore this message.

        You can find more information on how to do this here:
        https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#framework-specific-vite-plugins-have-to-be-explicitly-added  

        This change was necessary to support newer versions of Vite.
      `;
    }
    return dedent`
      Storybook 8.0.0 no longer ships with a Vite config build-in.
      Please add a vite.config.js file to your project root.

      You can find more information on how to do this here:
      https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#framework-specific-vite-plugins-have-to-be-explicitly-added

      This change was necessary to support newer versions of Vite.
    `;
  },
} satisfies Fix<Webpack5RunOptions>;
