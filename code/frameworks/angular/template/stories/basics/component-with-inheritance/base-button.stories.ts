import { BaseButtonComponent } from './base-button.component';

export default {
  // title: 'Basics / Component / With Inheritance',
  component: BaseButtonComponent,
};

export const BaseButton = () => ({
  props: {
    label: 'this is label',
  },
});
