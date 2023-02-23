import { moduleMetadata, Meta } from '@storybook/angular';
import { APP_INITIALIZER } from '@angular/core';
import { action } from '@storybook/addon-actions';
import Button from '../../button.component';

const meta: Meta<Button> = {
  component: Button,
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      providers: [
        {
          provide: APP_INITIALIZER,
          useFactory: () => {
            return action('APP_INITIALIZER useFactory called successfully');
          },
          multi: true,
        },
      ],
    }),
  ],
};

export default meta;

export const Default = {
  args: {
    text: 'Button',
  },
};
