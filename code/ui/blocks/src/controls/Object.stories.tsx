import type { Meta, StoryObj } from '@storybook/react';
import { ObjectControl } from './Object';
import { fn } from '@storybook/test';

export default {
  component: ObjectControl,
  tags: ['autodocs'],
  parameters: { withRawArg: 'value', controls: { include: ['value'] } },
  args: { name: 'object' },
} as Meta<typeof ObjectControl>;

export const Object: StoryObj<typeof ObjectControl> = {
  args: {
    value: {
      name: 'Michael',
      someDate: new Date('2022-10-30T12:31:11'),
      nested: { someBool: true, someNumber: 22 },
    },
  },
};

export const Array: StoryObj<typeof ObjectControl> = {
  args: {
    value: [
      'someString',
      22,
      true,
      new Date('2022-10-30T12:31:11'),
      { someBool: true, someNumber: 22 },
    ],
  },
};

export const EmptyObject: StoryObj<typeof ObjectControl> = {
  args: {
    value: {},
  },
};

export const EmptyArray: StoryObj<typeof ObjectControl> = {
  args: {
    value: {},
  },
};

export const Null: StoryObj<typeof ObjectControl> = {
  args: {
    value: null,
  },
};

export const Undefined: StoryObj<typeof ObjectControl> = {
  args: {
    value: undefined,
  },
};

class Person {
  constructor(
    public firstName: string,
    public lastName: string
  ) {}

  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

/**
 * We show a class collapsed as it might contain many methods.
 * It is read-only as we can not construct the class.
 */
export const Class: StoryObj<typeof ObjectControl> = {
  args: {
    value: new Person('Kasper', 'Peulen'),
  },
};

/**
 * We show a function collapsed. Even if it is "object" like, such as "fn".
 * It is read-only as we can not construct a function.
 */
export const Function: StoryObj<typeof ObjectControl> = {
  args: {
    value: fn(),
  },
};
