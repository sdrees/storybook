/* eslint-disable no-underscore-dangle */
import type { LoaderFunction } from '@storybook/types';
import { action } from './runtime';

const attachActionsToFunctionMocks: LoaderFunction = (context) => {
  const {
    args,
    parameters: { actions },
  } = context;
  if (actions?.disable) return;

  Object.entries(args)
    .filter(
      ([, value]) =>
        typeof value === 'function' && '_isMockFunction' in value && value._isMockFunction
    )
    .forEach(([key, value]) => {
      const previous = value.getMockImplementation();
      if (previous?._actionAttached !== true) {
        const implementation = (...params: unknown[]) => {
          action(key)(...params);
          return previous?.(...params);
        };
        implementation._actionAttached = true;
        value.mockImplementation(implementation);
      }
    });
};

export const loaders: LoaderFunction[] = [attachActionsToFunctionMocks];
