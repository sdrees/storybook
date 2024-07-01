import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { mergeConfig } from 'vite';
import type { StorybookConfig } from '../frameworks/react-vite';

const componentsPath = path.join(__dirname, '../core/src/components');
const managerApiPath = path.join(__dirname, '../core/src/manager-api');

const config: StorybookConfig = {
  stories: [
    {
      directory: '../core/src/manager',
      titlePrefix: '@manager',
    },
    {
      directory: '../core/src/preview-api',
      titlePrefix: '@preview',
    },
    {
      directory: '../core/src/components',
      titlePrefix: '@components',
    },
    {
      directory: '../lib/blocks/src',
      titlePrefix: '@blocks',
    },
    {
      directory: '../addons/controls/src',
      titlePrefix: '@addons/controls',
    },
    {
      directory: '../addons/onboarding/src',
      titlePrefix: '@addons/onboarding',
    },
    {
      directory: '../addons/interactions/src',
      titlePrefix: '@addons/interactions',
    },
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-storysource',
    '@storybook/addon-designs',
    '@storybook/addon-a11y',
    '@chromatic-com/storybook',
  ],
  build: {
    test: {
      // we have stories for the blocks here, we can't exclude them
      disableBlocks: false,
      // some stories in blocks (ArgTypes, Controls) depends on argTypes inference
      disableDocgen: false,
    },
  },
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  viteFinal: (viteConfig, { configType }) =>
    mergeConfig(viteConfig, {
      resolve: {
        alias: {
          ...(configType === 'DEVELOPMENT'
            ? {
                '@storybook/components': componentsPath,
                'storybook/internal/components': componentsPath,
                '@storybook/manager-api': managerApiPath,
                'storybook/internal/manager-api': managerApiPath,
              }
            : {}),
        },
      },
      optimizeDeps: { force: true },
      build: {
        // disable sourcemaps in CI to not run out of memory
        sourcemap: process.env.CI !== 'true',
      },
    }),
  logLevel: 'debug',
};

export default config;
