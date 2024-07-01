import type { Addon_DecoratorFunction } from 'storybook/internal/types';
import { withOutline } from './withOutline';
import { PARAM_KEY } from './constants';

export const decorators: Addon_DecoratorFunction[] = [withOutline];

export const initialGlobals = {
  [PARAM_KEY]: false,
};
