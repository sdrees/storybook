import { resolve } from 'node:path';
import type { Plugin } from 'vite';

export function mockSveltekitStores() {
  return {
    name: 'storybook:sveltekit-mock-stores',
    config: () => ({
      resolve: {
        alias: {
          $app: resolve(__dirname, '../src/mocks/app/'),
        },
      },
    }),
  } satisfies Plugin;
}
