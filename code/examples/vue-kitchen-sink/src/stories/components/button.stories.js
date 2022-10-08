import { within, userEvent } from '@storybook/testing-library';
import MyButton from '../Button.vue';

export default {
  title: 'Button',
  component: MyButton,
  argTypes: {
    color: { control: 'color' },
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { MyButton },
  template: `
    <my-button :color="color" :rounded="rounded">{{label}}</my-button>`,
});

export const Rounded = Template.bind({});
Rounded.args = {
  rounded: true,
  color: '#f00',
  label: 'A Button with rounded edges',
};
// Rounded.decorators = [
//   (storyFn, context) => {
//     return storyFn({ ...context, args: { ...context.args, label: 'Overridden args' } });
//   },
//   () => ({
//     template: '<div style="background: #eee;"><story/></div>',
//   }),
// ];
Rounded.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button'));
};

export const Square = Template.bind({});
Square.args = {
  rounded: false,
  color: '#00f',
  label: 'A Button with square edges',
};

export const WithDefaultRender = {
  args: {
    rounded: true,
    color: '#fba',
    label: 'Button with default render',
  },
};
