import { expect, mocked, getByRole, spyOn, userEvent } from '@storybook/test';

const meta = {
  component: globalThis.Components.Button,
  beforeEach() {
    spyOn(console, 'log').mockName('console.log');
    console.log('first');
  },
};

export default meta;

export const BeforeEachOrder = {
  parameters: {
    chromatic: { disable: true },
  },
  beforeEach() {
    console.log('second');
  },
  args: {
    label: 'Button',
    onClick: () => {
      console.log('third');
    },
  },
  async play({ canvasElement }) {
    await userEvent.click(getByRole(canvasElement, 'button'));

    await expect(mocked(console.log).mock.calls).toEqual([['first'], ['second'], ['third']]);
  },
};
