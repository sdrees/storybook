import type { Icons } from '@storybook/components';
import type { ComponentProps } from 'react';
import type { API_HashEntry, API_StatusState, API_StatusValue } from '@storybook/types';
// eslint-disable-next-line import/no-cycle
import { getDescendantIds } from './tree';

export const statusPriority: API_StatusValue[] = ['unknown', 'pending', 'success', 'warn', 'error'];
export const statusMapping: Record<
  API_StatusValue,
  [ComponentProps<typeof Icons>['icon'] | null, string | null, string | null]
> = {
  unknown: [null, null, null],
  pending: ['watch', 'currentColor', 'currentColor'],
  success: ['circle', 'green', 'currentColor'],
  warn: ['circle', 'orange', '#A15C20'],
  error: ['circle', 'red', 'brown'],
};

export const getHighestStatus = (statuses: API_StatusValue[]): API_StatusValue => {
  return statusPriority.reduce(
    (acc, status) => (statuses.includes(status) ? status : acc),
    'unknown'
  );
};

export function getGroupStatus(
  collapsedData: {
    [x: string]: Partial<API_HashEntry>;
  },
  status: API_StatusState
): Record<string, API_StatusValue> {
  return Object.values(collapsedData).reduce<Record<string, API_StatusValue>>((acc, item) => {
    if (item.type === 'group' || item.type === 'component') {
      const leafs = getDescendantIds(collapsedData as any, item.id, false)
        .map((id) => collapsedData[id])
        .filter((i) => i.type === 'story');

      const combinedStatus = getHighestStatus(
        leafs.flatMap((story) => Object.values(status?.[story.id] || {})).map((s) => s.status)
      );

      if (combinedStatus) {
        acc[item.id] = combinedStatus;
      }
    }
    return acc;
  }, {});
}
