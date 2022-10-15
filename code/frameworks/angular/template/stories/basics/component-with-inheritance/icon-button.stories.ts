import { IconButtonComponent } from './icon-button.component';

export default {
  // title: 'Basics / Component / With Inheritance',
  component: IconButtonComponent,
};

export const IconButton = () => ({
  props: {
    icon: 'this is icon',
    label: 'this is label',
  },
});
