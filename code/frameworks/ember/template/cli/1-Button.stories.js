import { hbs } from 'ember-cli-htmlbars';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

// More on default export: https://storybook.js.org/docs/ember/writing-stories/introduction#default-export
export default {
  title: 'Button',
  render: (args) => ({
    template: hbs`<button {{action onClick}}>{{label}}</button>`,
    context: args,
  }),
  // More on argTypes: https://storybook.js.org/docs/ember/api/argtypes
  argTypes: {
    label: { control: 'text' },
  },
};

// More on component templates: https://storybook.js.org/docs/ember/writing-stories/introduction#using-args
export const Text = {
  args: {
    label: 'Button',
    onClick: action('onClick'),
  },
};

export const Emoji = {
  args: {
    label: '😀 😎 👍 💯',
  },
};

export const TextWithAction = {
  render: () => ({
    template: hbs`
    <button {{action onClick}}>
      Trigger Action
    </button>
  `,
    context: {
      onClick: () => action('This was clicked')(),
    },
  }),
  name: 'With an action',
  parameters: {
    notes: 'My notes on a button with emojis',
  },
};

export const ButtonWithLinkToAnotherStory = {
  render: () => ({
    template: hbs`
    <button {{action onClick}}>
      Go to Welcome Story
    </button>
  `,
    context: {
      onClick: linkTo('example-introduction--page'),
    },
  }),
  name: 'button with link to another story',
};
