import React from 'react';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context';
import { PathnameContext, SearchParamsContext } from 'next/dist/shared/lib/hooks-client-context';
import type { RouteParams } from './types';

type AppRouterProviderProps = {
  action: (name: string) => (...args: any[]) => void;
  routeParams: RouteParams;
};

const AppRouterProvider: React.FC<AppRouterProviderProps> = ({ children, action, routeParams }) => {
  const { pathname, query, ...restRouteParams } = routeParams;
  return (
    <AppRouterContext.Provider
      value={{
        push(...args) {
          action('nextNavigation.push')(...args);
        },
        replace(...args) {
          action('nextNavigation.replace')(...args);
        },
        forward(...args) {
          action('nextNavigation.forward')(...args);
        },
        back(...args) {
          action('nextNavigation.back')(...args);
        },
        prefetch(...args) {
          action('nextNavigation.prefetch')(...args);
        },
        refresh: () => {
          action('nextNavigation.refresh')();
        },
        ...restRouteParams,
      }}
    >
      <SearchParamsContext.Provider value={new URLSearchParams(query)}>
        <PathnameContext.Provider value={pathname}>{children}</PathnameContext.Provider>
      </SearchParamsContext.Provider>
    </AppRouterContext.Provider>
  );
};

export default AppRouterProvider;
