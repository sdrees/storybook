module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  core: {
    builder: 'webpack4',
    disableTelemetry: true,
  },
  features: {
    buildStoriesJson: true,
    channelOptions: { allowFunction: false, maxDepth: 10 },
  },
};
