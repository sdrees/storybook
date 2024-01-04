/* eslint-disable no-underscore-dangle */
import type {
  Args,
  LoaderFunction,
  PlayFunction,
  PlayFunctionContext,
  StepLabel,
} from '@storybook/types';
import { instrument } from '@storybook/instrumenter';

export const { step: runStep } = instrument(
  {
    step: (label: StepLabel, play: PlayFunction, context: PlayFunctionContext<any>) =>
      play(context),
  },
  { intercept: true }
);

const instrumentSpies: LoaderFunction = ({ initialArgs }) => {
  const argTypesWithAction = Object.entries(initialArgs).filter(
    ([, value]) =>
      typeof value === 'function' &&
      '_isMockFunction' in value &&
      value._isMockFunction &&
      !value._instrumented
  );

  return argTypesWithAction.reduce((acc, [key, value]) => {
    const instrumented = instrument({ [key]: () => value }, { retain: true })[key];
    acc[key] = instrumented();
    // this enhancer is being called multiple times
    // eslint-disable-next-line no-param-reassign
    value._instrumented = true;
    return acc;
  }, {} as Args);
};

export const argsEnhancers = [instrumentSpies];

export const parameters = {
  throwPlayFunctionExceptions: false,
};
