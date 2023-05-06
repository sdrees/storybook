import type { Addon_DecoratorFunction, ArgTypesEnhancer } from '@storybook/types';
import { SourceType, enhanceArgTypes } from '@storybook/docs-tools';
import { extractArgTypes, extractComponentDescription } from './custom-elements';
import { sourceDecorator } from './sourceDecorator';

export const decorators: Addon_DecoratorFunction<unknown>[] = [sourceDecorator];

export const parameters: {} = {
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

export const argTypesEnhancers: ArgTypesEnhancer[] = [enhanceArgTypes];
