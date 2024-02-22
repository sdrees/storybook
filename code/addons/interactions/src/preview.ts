import type {
  ArgsEnhancer,
  PlayFunction,
  PlayFunctionContext,
  Renderer,
  StepLabel,
} from '@storybook/types';
import { fn, isMockFunction } from '@storybook/test';
import { instrument } from '@storybook/instrumenter';

export const { step: runStep } = instrument(
  {
    step: (label: StepLabel, play: PlayFunction, context: PlayFunctionContext<any>) =>
      play(context),
  },
  { intercept: true }
);

export const traverseArgs = (value: unknown, depth = 0, key?: string): unknown => {
  // Make sure to not get in infinite loops with self referencing args
  if (depth > 5) return value;
  if (value == null) return value;
  if (isMockFunction(value)) {
    // Makes sure we get the arg name in the interactions panel
    if (key) value.mockName(key);
    return value;
  }

  // wrap explicit actions in a spy
  if (
    typeof value === 'function' &&
    'isAction' in value &&
    value.isAction &&
    !('implicit' in value && value.implicit)
  ) {
    const mock = fn(value as any);
    if (key) mock.mockName(key);
    return mock;
  }

  if (Array.isArray(value)) {
    depth++;
    return value.map((item) => traverseArgs(item, depth));
  }

  if (typeof value === 'object' && value.constructor === Object) {
    depth++;
    for (const [k, v] of Object.entries(value)) {
      if (Object.getOwnPropertyDescriptor(value, k).writable) {
        // We have to mutate the original object for this to survive HMR.
        (value as Record<string, unknown>)[k] = traverseArgs(v, depth, k);
      }
    }
    return value;
  }
  return value;
};

const wrapActionsInSpyFns: ArgsEnhancer<Renderer> = ({ initialArgs }) => traverseArgs(initialArgs);

export const argsEnhancers = [wrapActionsInSpyFns];

export const parameters = {
  throwPlayFunctionExceptions: false,
};
