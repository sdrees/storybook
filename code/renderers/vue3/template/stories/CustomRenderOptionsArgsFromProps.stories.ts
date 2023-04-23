import type { Meta } from '@storybook/vue3';
import { defineComponent } from 'vue';
import Reactivity from './Reactivity.vue';
import * as ReactiveDecorators from './ReactiveDecorators.stories';

const meta = {
  ...ReactiveDecorators.default,
  component: Reactivity,
  render: (args, { argTypes }) => {
    return defineComponent({
      props: Object.keys(argTypes),
      components: { Reactivity },
      template: `<div>Custom render uses options api and binds args to props: <Reactivity v-bind="$props">
         <template #header="{title}"><h3>{{ header }} - Title: {{ title }}</h3></template>
         {{ $props.default }}
         <template #footer>{{ footer }}</template>
         </Reactivity>
        </div>`,
    });
  },
} satisfies Meta<typeof Reactivity>;

export default meta;

export {
  NoDecorators,
  DecoratorFunctionalComponent,
  DecoratorFunctionalComponentArgsFromContext,
  DecoratorFunctionalComponentArgsFromProps,
  DecoratorComponentOptions,
  DecoratorComponentOptionsArgsFromData,
  DecoratorComponentOptionsArgsFromProps,
} from './ReactiveDecorators.stories';
