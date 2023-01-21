import { SourceType, enhanceArgTypes } from '@storybook/docs-tools';

import { sourceDecorator } from './sourceDecorator';

export const decorators = [sourceDecorator];

export const parameters = {
  docs: {
    story: { inline: true },
    transformSource: undefined as unknown,
    source: {
      type: SourceType.DYNAMIC,
      language: 'html',
      code: undefined as unknown,
      excludeDecorators: undefined as unknown,
    },
  },
};

export const argTypesEnhancers = [enhanceArgTypes];
