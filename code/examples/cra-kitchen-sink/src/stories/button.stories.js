import React from 'react';
import { Button } from '../components/react-demo';

export default {
  title: 'Button',
  component: Button,
};

export const Story1 = () => <Button>Hello Button</Button>;
Story1.storyName = 'with text';

Story1.parameters = {
  options: { selectedPanel: 'storybook/actions/panel' },
};

export const Story2 = () => (
  <Button>
    <span role="img" aria-label="yolo">
      😀 😎 👍 💯
    </span>
  </Button>
);
Story2.storyName = 'with some emoji';

Story2.parameters = {
  options: { selectedPanel: 'storybook/actions/panel' },
};
