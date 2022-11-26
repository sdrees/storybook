import type { Store_PropDescriptor, StrictArgTypes } from '@storybook/types';
import pickBy from 'lodash/pickBy';

const matches = (name: string, descriptor: Store_PropDescriptor) =>
  Array.isArray(descriptor) ? descriptor.includes(name) : name.match(descriptor);

export const filterArgTypes = (
  argTypes: StrictArgTypes,
  include?: Store_PropDescriptor,
  exclude?: Store_PropDescriptor
) => {
  if (!include && !exclude) {
    return argTypes;
  }
  return (
    argTypes &&
    pickBy(argTypes, (argType, key) => {
      const name = argType.name || key;
      return (!include || matches(name, include)) && (!exclude || !matches(name, exclude));
    })
  );
};
