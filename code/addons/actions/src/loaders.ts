/* eslint-disable no-underscore-dangle */
import type { LoaderFunction } from '@storybook/types';
import { action } from './runtime';

export const tinySpyInternalState = Symbol.for('tinyspy:spy');

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
      // See this discussion for context:
      // https://github.com/vitest-dev/vitest/pull/5352
      const previous =
        value.getMockImplementation() ??
        (tinySpyInternalState in value ? value[tinySpyInternalState]?.getOriginal() : undefined);
      if (previous?._actionAttached !== true && previous?.isAction !== true) {
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
