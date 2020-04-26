import React from 'react';
import toReact from '@egoist/vue-to-react';
import { StoryFn } from '@storybook/addons';
import { addParameters } from '@storybook/client-api';
import { extractArgTypes } from './extractArgTypes';
import { extractComponentDescription } from '../../lib/docgen';

addParameters({
  docs: {
    inlineStories: true,
    prepareForInline: (storyFn: StoryFn) => {
      const Story = toReact(storyFn());
      return <Story />;
    },
    extractArgTypes,
    extractComponentDescription,
  },
});
