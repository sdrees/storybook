import globalThis from 'global';

import { action } from '@storybook/addon-actions';

export default {
  component: globalThis.Components.Button,
  args: {
    children: 'Click Me!',
  },
};

export const BasicExample = {
  args: { onClick: action('hello-world') },
};
