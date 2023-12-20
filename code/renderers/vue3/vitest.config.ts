/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig, mergeConfig } from 'vitest/config';
import { sep, posix } from 'path';
import vue from '@vitejs/plugin-vue';
import { vitestCommonConfig } from '../../vitest.workspace';

export default mergeConfig(
  vitestCommonConfig,
  // @ts-expect-error seems like there's a type mismatch in the vue plugin
  defineConfig({
    test: {
      environment: 'jsdom',
      name: __dirname.split(sep).slice(-2).join(posix.sep),
    },
    // @ts-expect-error seems like there's a type mismatch in the vue plugin
    plugins: [vue()],
  })
);
