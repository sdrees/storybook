import type { ArgsEnhancer } from '@storybook/types';
import {
  addActionsFromArgTypes,
  attachActionsToFunctionMocks,
  inferActionsFromArgTypesRegex,
} from './addArgsHelpers';

export const argsEnhancers: ArgsEnhancer[] = [
  addActionsFromArgTypes,
  inferActionsFromArgTypesRegex,
  attachActionsToFunctionMocks,
];
