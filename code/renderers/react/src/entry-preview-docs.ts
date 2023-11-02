import type { ArgTypesEnhancer, DecoratorFunction } from '@storybook/types';
import { extractComponentDescription, enhanceArgTypes } from '@storybook/docs-tools';

import { extractArgTypes } from './docs/extractArgTypes';
import { jsxDecorator } from './docs/jsxDecorator';
import type { ReactRenderer } from './types';

export const parameters = {
  docs: {
    story: { inline: true },
    extractArgTypes,
    extractComponentDescription,
  },
};

export const decorators: DecoratorFunction<ReactRenderer>[] = [jsxDecorator];

export const argTypesEnhancers: ArgTypesEnhancer<ReactRenderer>[] = [enhanceArgTypes];

export { applyDecorators } from './docs/applyDecorators';
