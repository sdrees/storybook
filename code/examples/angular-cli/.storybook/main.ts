const mainConfig: import('@storybook/angular').StorybookConfig = {
  stories: ['../src/stories/**/*.stories.@(ts|tsx|js|jsx|mdx)'],
  logLevel: 'debug',
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-storysource',
    '@storybook/addon-actions',
    '@storybook/addon-viewport',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
    '@storybook/addon-jest',
    '@storybook/addon-backgrounds',
    '@storybook/addon-a11y',
    '@storybook/addon-toolbars',
    '@storybook/addon-highlight',
  ],
  core: {
    channelOptions: { allowFunction: false, maxDepth: 10 },
    disableTelemetry: true,
  },
  staticDirs: [
    '../src/assets',
    // reproduction of https://github.com/storybookjs/storybook/issues/16732
    { from: '../src/assets/a', to: 'assets' },
    { from: '../src/assets/b', to: 'assets/b' },
  ],
  features: {
    buildStoriesJson: false,
    breakingChangesV7: false,
    storyStoreV7: false,
  },
  framework: {
    name: '@storybook/angular',
    options: {
      enableIvy: true,
      enableNgcc: true,
    },
  },
};
module.exports = mainConfig;
