module.exports = {
  root: true,
  extends: ['@storybook/eslint-config-storybook', 'plugin:storybook/recommended'],
  rules: {
    '@typescript-eslint/ban-ts-comment': 'warn',
    'jest/no-standalone-expect': [
      'error',
      { additionalTestBlockFunctions: ['it.skipWindows', 'it.onWindows'] },
    ],
    'no-use-before-define': 'off',
  },
  overrides: [
    {
      files: ['*.mjs'],
      rules: {
        'import/extensions': ['error', 'always'],
      },
    },
  ],
};
