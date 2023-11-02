import type { ArgTypesEnhancer, DecoratorFunction } from '@storybook/types';
import { extractComponentDescription, enhanceArgTypes } from '@storybook/docs-tools';
import { extractArgTypes } from './docs/extractArgTypes';
import { sourceDecorator } from './docs/sourceDecorator';
import type { VueRenderer } from './types';

export const parameters = {
  docs: {
    story: { inline: true, iframeHeight: '120px' },
    extractArgTypes,
    extractComponentDescription,
  },
};

export const decorators: DecoratorFunction<VueRenderer>[] = [sourceDecorator];

export const argTypesEnhancers: ArgTypesEnhancer<VueRenderer>[] = [enhanceArgTypes];
