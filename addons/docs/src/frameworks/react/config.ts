import type { PartialStoryFn } from '@storybook/csf';
import type { ReactFramework } from '@storybook/react';

import { extractArgTypes } from './extractArgTypes';
import { extractComponentDescription } from '../../lib/docgen';
import { jsxDecorator } from './jsxDecorator';

export const parameters = {
  docs: {
    inlineStories: true,
    // NOTE: that the result is a react element. Hooks support is provided by the outer code.
    prepareForInline: (storyFn: PartialStoryFn<ReactFramework>) => storyFn(),
    extractArgTypes,
    extractComponentDescription,
  },
};

export const decorators = [jsxDecorator];
