import { FormsModule } from '@angular/forms';
import { Meta, StoryFn, moduleMetadata } from '@storybook/angular';
import { CustomCvaComponent } from './custom-cva.component';

export default {
  // title: 'Basics / Angular forms / ControlValueAccessor',
  component: CustomCvaComponent,
  decorators: [
    moduleMetadata({
      imports: [FormsModule],
    }),
    (storyFn) => {
      const story = storyFn();
      console.log(story);
      return story;
    },
  ],
} as Meta;

export const SimpleInput: StoryFn = () => ({
  props: {
    ngModel: 'Type anything',
    ngModelChange: () => {},
  },
});

SimpleInput.storyName = 'Simple input';
