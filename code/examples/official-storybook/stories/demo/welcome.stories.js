import React from 'react';
import { Welcome } from '../../components/react-demo';

export default {
  title: 'Other/Demo/Welcome',
  component: Welcome,
};

// Some other valid values:
// - 'other-demo-buttonmdx--with-text'
// - 'Other/Demo/ButtonMdx'
export const ToStorybook = () => <Welcome showApp={() => {}} />;
ToStorybook.storyName = 'to Storybook';
