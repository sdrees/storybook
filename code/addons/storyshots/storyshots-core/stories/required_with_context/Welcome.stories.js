import React from 'react';

import { Welcome } from '../react-demo';

export default {
  title: 'Welcome',

  parameters: {
    component: Welcome,
  },
};

export const ToStorybook = () => <Welcome showApp={() => {}} />;

ToStorybook.storyName = 'to Storybook';
