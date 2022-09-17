import React from 'react';
import { Welcome } from '../components/react-demo';

export default {
  title: 'Welcome',
  component: Welcome,
};

export const ToStorybook = () => <Welcome showApp={() => {}} />;

ToStorybook.storyName = 'to Storybook';
