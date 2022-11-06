import { vite as csfPlugin } from '@storybook/csf-plugin';
import type { StorybookConfig } from '../../frameworks/react-vite/dist';

const isBlocksOnly = process.env.BLOCKS_ONLY === 'true';

const allStories = [
  {
    directory: '../manager/src',
    titlePrefix: '@storybook-manager',
  },
  {
    directory: '../components/src',
    titlePrefix: '@storybook-components',
  },
  {
    directory: '../blocks/src',
    titlePrefix: '@storybook-blocks',
  },
];
const blocksOnlyStories = ['../blocks/src/@(blocks|controls)/**/*.@(mdx|stories.@(tsx|ts|jsx|js))'];

const config: StorybookConfig = {
  stories: isBlocksOnly ? blocksOnlyStories : allStories,
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  viteFinal: (vite) => ({
    ...vite,
    plugins: [...(vite.plugins || []), csfPlugin({})],
    optimizeDeps: { ...vite.optimizeDeps, force: true },
  }),
};

export default config;
