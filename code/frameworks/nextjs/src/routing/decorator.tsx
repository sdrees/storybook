import * as React from 'react';
import type { Addon_StoryContext } from '@storybook/types';
import { action } from '@storybook/addon-actions';
import { PageRouterProvider } from './page-router-provider';
import type { AppRouterProvider as TAppRouterProvider } from './app-router-provider';
import type { RouteParams, NextAppDirectory } from './types';

const defaultRouterParams: RouteParams = {
  pathname: '/',
  query: {},
};

export const RouterDecorator = (
  Story: React.FC,
  { globals, parameters }: Addon_StoryContext
): React.ReactNode => {
  const nextAppDirectory =
    (parameters.nextjs?.appDirectory as NextAppDirectory | undefined) ?? false;

  const [AppRouterProvider, setAppRouterProvider] = React.useState<
    typeof TAppRouterProvider | undefined
  >();

  React.useEffect(() => {
    if (!nextAppDirectory) {
      return;
    }
    import('./app-router-provider').then((exports) =>
      setAppRouterProvider(() => exports.AppRouterProvider)
    );
  }, [nextAppDirectory]);

  if (nextAppDirectory) {
    if (!AppRouterProvider) {
      return null;
    }
    return (
      <AppRouterProvider
        action={action}
        routeParams={{
          ...defaultRouterParams,
          ...parameters.nextjs?.navigation,
        }}
      >
        <Story />
      </AppRouterProvider>
    );
  }

  return (
    <PageRouterProvider
      action={action}
      globals={globals}
      routeParams={{
        ...defaultRouterParams,
        ...parameters.nextjs?.router,
      }}
    >
      <Story />
    </PageRouterProvider>
  );
};
