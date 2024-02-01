import { it } from 'vitest';
import { expect, fn } from '@storybook/test';

it('storybook expect and fn can be used in vitest test', () => {
  const spy = fn();
  spy(1);
  expect(spy).toHaveBeenCalledWith(1);
});
