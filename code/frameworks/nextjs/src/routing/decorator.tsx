import * as React from 'react';
// this will be aliased by webpack at runtime (this is just for typing)
import { action as originalAction } from '@storybook/addon-actions';
import { StoryContext } from '@storybook/addons';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import Router from 'next/router';

let action: typeof originalAction;

try {
  action = require('@storybook/addon-actions').action;
} catch {
  action = () => () => {};
}

const defaultRouter = {
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  push(...args: unknown[]): Promise<boolean> {
    action('nextRouter.push')(...args);
    return Promise.resolve(true);
  },
  replace(...args: unknown[]): Promise<boolean> {
    action('nextRouter.replace')(...args);
    return Promise.resolve(true);
  },
  reload(...args: unknown[]): void {
    action('nextRouter.reload')(...args);
  },
  back(...args: unknown[]): void {
    action('nextRouter.back')(...args);
  },
  prefetch(...args: unknown[]): Promise<void> {
    action('nextRouter.prefetch')(...args);
    return Promise.resolve();
  },
  beforePopState(...args: unknown[]): void {
    action('nextRouter.beforePopState')(...args);
  },
  events: {
    on(...args: unknown[]): void {
      action('nextRouter.events.on')(...args);
    },
    off(...args: unknown[]): void {
      action('nextRouter.events.off')(...args);
    },
    emit(...args: unknown[]): void {
      action('nextRouter.events.emit')(...args);
    },
  },
  isFallback: false,
};

export const RouterDecorator = (
  Story: React.FC,
  { globals, parameters }: StoryContext
): React.ReactNode => {
  const nextRouterParams = parameters.nextRouter ?? {};

  Router.router = {
    ...defaultRouter,
    locale: globals?.locale,
    ...nextRouterParams,
  } as NonNullable<typeof Router.router>;

  return (
    <RouterContext.Provider value={Router.router as any}>
      <Story />
    </RouterContext.Provider>
  );
};
