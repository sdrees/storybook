import { Args } from '@storybook/angular';
import { DocButtonComponent } from './doc-button.component';

export default {
  component: DocButtonComponent,
};

export const Basic = (args: Args) => ({
  props: args,
});
Basic.args = { label: 'Args test', isDisabled: false };
Basic.ArgTypes = {
  theDefaultValue: {
    table: {
      defaultValue: { summary: 'Basic default value' },
    },
  },
};

export const WithTemplate = (args: Args) => ({
  props: args,
  template: '<my-button [label]="label" [appearance]="appearance"></my-button>',
});
WithTemplate.args = { label: 'Template test', appearance: 'primary' };
