import { action } from '@storybook/addon-actions';
import { CustomCvaComponent } from './custom-cva.component';

export default {
  title: 'Custom/ngModel',
};

export const CustomControlValueAccessor = () => ({
  component: CustomCvaComponent,
  props: {
    ngModel: 'Type anything',
    ngModelChange: action('ngModelChnange'),
  },
});

CustomControlValueAccessor.storyName = 'custom ControlValueAccessor';
