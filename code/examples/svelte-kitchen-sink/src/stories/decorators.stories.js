import { setContext } from 'svelte';
import Context from '../components/Context.svelte';
import BorderDecorator from './BorderDecorator.svelte';

export default {
  title: 'Decorators',
  component: Context,
  decorators: [
    () => BorderDecorator,
    () => ({ Component: BorderDecorator, props: { color: 'blue' } }),
  ],
};

export const Decorators = () => ({
  on: {
    click: () => {},
  },
});
Decorators.decorators = [
  () => {
    setContext('storybook/test', 'settled from decorator');
  },
];
