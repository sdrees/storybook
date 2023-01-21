import { StoryFn, Meta, moduleMetadata } from '@storybook/angular';
import { ChipsModule } from './angular-src/chips.module';
import { ChipComponent } from './angular-src/chip.component';

export default {
  component: ChipComponent,
  decorators: [
    moduleMetadata({
      imports: [ChipsModule],
    }),
  ],
} as Meta;

export const Chip: StoryFn = (args) => ({
  props: args,
});

Chip.args = {
  displayText: 'Chip',
};
Chip.argTypes = {
  removeClicked: { action: 'Remove icon clicked' },
};
