/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig, mergeConfig } from 'vitest/config';
import { sep, posix } from 'path';
import { vitestCommonConfig } from '../../vitest.workspace';

export default defineConfig(({ mode }) => {
  return mergeConfig(vitestCommonConfig, {
    test: {
      setupFiles: ['src/test-setup.ts'],
      environment: 'jsdom',

      name: __dirname.split(sep).slice(-2).join(posix.sep),
    },
  });
});
