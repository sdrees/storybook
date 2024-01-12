// eslint-disable-next-line import/extensions
import base from '@storybook/linter-config/prettier.config.js';

export default {
  ...base,
  overrides: [
    {
      files: '*.component.html',
      options: { parser: 'angular' },
    },
  ],
  arrowParens: 'always',
};
