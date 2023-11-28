import React from 'react';
import {
  LayoutRouterContext,
  AppRouterContext,
  GlobalLayoutRouterContext,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import {
  PathnameContext,
  SearchParamsContext,
} from 'next/dist/shared/lib/hooks-client-context.shared-runtime';
import type { FlightRouterState } from 'next/dist/server/app-render/types';
import type { RouteParams } from './types';

type AppRouterProviderProps = {
  action: (name: string) => (...args: any[]) => void;
  routeParams: RouteParams;
};

const getParallelRoutes = (segmentsList: Array<string>): FlightRouterState => {
  const segment = segmentsList.shift();

  if (segment) {
    return [segment, { children: getParallelRoutes(segmentsList) }];
  }

  return [] as any;
};

export const AppRouterProvider: React.FC<React.PropsWithChildren<AppRouterProviderProps>> = ({
  children,
  action,
  routeParams,
}) => {
  const { pathname, query, segments = [], ...restRouteParams } = routeParams;

  const tree: FlightRouterState = [pathname, { children: getParallelRoutes([...segments]) }];

  // https://github.com/vercel/next.js/blob/canary/packages/next/src/client/components/app-router.tsx#L436
  return (
    <PathnameContext.Provider value={pathname}>
      <SearchParamsContext.Provider value={new URLSearchParams(query)}>
        <GlobalLayoutRouterContext.Provider
          value={{
            changeByServerResponse() {
              // NOOP
            },
            buildId: 'storybook',
            tree,
            focusAndScrollRef: {
              apply: false,
              hashFragment: null,
              segmentPaths: [tree],
              onlyHashChange: false,
            },
            nextUrl: pathname,
          }}
        >
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
            <LayoutRouterContext.Provider
              value={{
                childNodes: new Map(),
                tree,
                url: pathname,
              }}
            >
              {children}
            </LayoutRouterContext.Provider>
          </AppRouterContext.Provider>
        </GlobalLayoutRouterContext.Provider>
      </SearchParamsContext.Provider>
    </PathnameContext.Provider>
  );
};
