import React from 'react';

import { Button } from '../react-demo';

export default {
  title: 'Button',

  parameters: {
    component: Button,
  },
};

export const WithText = () => <Button>Hello Button</Button>;

export const WithSomeEmoji = () => (
  <Button>
    <span role="img" aria-label="so cool">
      😀 😎 👍 💯
    </span>
  </Button>
);

WithSomeEmoji.storyName = 'with some emoji';
