module.exports = {
  logLevel: 'debug',
  stories: ['../stories/**/*.stories.js', '../stories/**/*.stories.mdx'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-a11y',
    '@storybook/addon-actions',
    '@storybook/addon-backgrounds',
    '@storybook/addon-knobs',
    '@storybook/addon-links',
    '@storybook/addon-storysource',
    '@storybook/addon-viewport',
  ],
  core: {
    builder: 'webpack4',
  },
};
