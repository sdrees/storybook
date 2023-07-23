import type { Meta, StoryObj } from '@storybook/react';

import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Textarea',
  component: Textarea,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Base: Story = {
  args: {
    placeholder: 'Hello World',
  },
};

export const Filled: Story = {
  args: {
    ...Base.args,
    value:
      'Self ocean ultimate reason faith virtues evil eternal-return moral strong superiority. Society will christian god holiest evil virtues ultimate salvation aversion victorious strong eternal-return. Ascetic pious hope selfish battle pinnacle revaluation passion ocean passion chaos reason intentions. Hope hatred pious superiority ascetic chaos ultimate mountains ideal. Superiority good abstract hatred holiest passion ultimate evil inexpedient joy. Salvation war salvation ideal decieve good law ascetic hatred transvaluation horror good. Zarathustra aversion pious truth burying evil inexpedient spirit virtues virtues hope salvation transvaluation. Enlightenment chaos ascetic salvation god holiest play marvelous oneself ocean. Enlightenment faithful dead truth insofar fearful madness love.Inexpedient war hatred superiority disgust justice superiority. Chaos justice contradict christian decieve god. Revaluation suicide hope enlightenment decrepit truth hatred insofar gains sexuality merciful ocean revaluation depths. Revaluation ocean superiority endless of evil horror. Ultimate salvation joy good good endless will horror aversion superiority depths. Evil hatred ideal pious joy reason.',
  },
};

export const Disabled: Story = {
  args: {
    ...Base.args,
    disabled: true,
  },
};
