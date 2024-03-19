/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig, mergeConfig } from 'vitest/config';
import { sep, posix } from 'path';
import { vitestCommonConfig } from '../../vitest.workspace';

export default defineConfig(
  mergeConfig(vitestCommonConfig, {
    test: {
      environment: 'jsdom',
      name: __dirname.split(sep).slice(-2).join(posix.sep),
      // setupFiles: ['./vitest-setup.ts'],
    },
    plugins: [
      // eslint-disable-next-line import/no-unresolved
      import('@sveltejs/vite-plugin-svelte').then(({ svelte, vitePreprocess }) =>
        svelte({ preprocess: vitePreprocess() })
      ),
    ],
  })
);
