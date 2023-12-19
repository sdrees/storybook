import type { Addon_DecoratorFunction } from '@storybook/types';
import { ServerComponentDecorator } from './decorator';

export const decorators: Addon_DecoratorFunction<any>[] = [ServerComponentDecorator];

export const parameters = {
  nextjs: {
    rsc: true,
  },
};
