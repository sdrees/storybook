import {
  useRouter,
  usePathname,
  useSearchParams,
  useParams,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
} from 'next/navigation';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

function Component() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const segment = useSelectedLayoutSegment();
  const segments = useSelectedLayoutSegments();

  const searchParamsList = searchParams ? Array.from(searchParams.entries()) : [];

  const routerActions = [
    {
      cb: () => router.back(),
      name: 'Go back',
    },
    {
      cb: () => router.forward(),
      name: 'Go forward',
    },
    {
      cb: () => router.prefetch('/prefetched-html'),
      name: 'Prefetch',
    },
    {
      // @ts-expect-error (old API)
      cb: () => router.push('/push-html', { forceOptimisticNavigation: true }),
      name: 'Push HTML',
    },
    {
      cb: () => router.refresh(),
      name: 'Refresh',
    },
    {
      // @ts-expect-error (old API)
      cb: () => router.replace('/replaced-html', { forceOptimisticNavigation: true }),
      name: 'Replace',
    },
  ];

  return (
    <div>
      <div>pathname: {pathname}</div>
      <div>segment: {segment}</div>
      <div>segments: {segments.join(',')}</div>
      <div>
        searchparams:{' '}
        <ul>
          {searchParamsList.map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
        </ul>
      </div>
      <div>
        params:{' '}
        <ul>
          {Object.entries(params).map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
        </ul>
      </div>
      {routerActions.map(({ cb, name }) => (
        <div key={name} style={{ marginBottom: '1em' }}>
          <button type="button" onClick={cb}>
            {name}
          </button>
        </div>
      ))}
    </div>
  );
}

type Story = StoryObj<typeof Component>;

export default {
  component: Component,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/hello',
        query: {
          foo: 'bar',
        },
      },
    },
  },
} as Meta<typeof Component>;

export const Default: Story = {};

export const WithSegmentDefined: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        segments: ['dashboard', 'settings'],
      },
    },
  },
};

export const WithSegmentDefinedForParams: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        segments: [
          ['slug', 'hello'],
          ['framework', 'nextjs'],
        ],
      },
    },
  },
};
