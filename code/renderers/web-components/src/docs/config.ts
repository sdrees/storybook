import { SourceType, enhanceArgTypes } from '@storybook/docs-tools';
import { extractArgTypes, extractComponentDescription } from './custom-elements';
import { sourceDecorator } from './sourceDecorator';

export const decorators = [sourceDecorator];

export const parameters = {
  docs: {
    extractArgTypes,
    extractComponentDescription,
    story: { inline: true },
    source: {
      type: SourceType.DYNAMIC,
      language: 'html',
    },
  },
};

export const argTypesEnhancers = [enhanceArgTypes];
