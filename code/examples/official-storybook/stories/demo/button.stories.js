import React, { useState } from 'react';
import { Button } from '../../components/react-demo';

export default {
  title: 'Other/Demo/Button',
  component: Button,
  id: 'demo-button-id',
  parameters: {
    docs: {
      inlineStories: false,
      description: {
        component: 'Component description **markdown** override',
      },
    },
  },
};

export const WithText = () => <Button>Hello Button</Button>;
WithText.storyName = 'with text';

export const WithSomeEmoji = () => (
  <Button>
    <span role="img" aria-label="so cool">
      😀 😎 👍 💯
    </span>
  </Button>
);
WithSomeEmoji.storyName = 'with some emoji';

export const WithCounter = () => {
  const [counter, setCounter] = useState(0);
  const label = `Testing: ${counter}`;
  return <Button onClick={() => setCounter(counter + 1)}>{label}</Button>;
};

WithCounter.storyName = 'with counter';

WithCounter.parameters = {
  docs: {
    description: {
      story: 'This demonstrates react hooks working inside stories. **Go team!** 🚀',
    },
  },
};
