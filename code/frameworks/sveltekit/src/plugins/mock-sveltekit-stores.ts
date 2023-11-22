import { resolve } from 'node:path';
import { mergeConfig, type Plugin } from 'vite';

export function mockSveltekitStores() {
  return {
    name: 'storybook:sveltekit-mock-stores',
    enforce: 'post',
    config: (config) =>
      mergeConfig(config, {
        resolve: {
          alias: {
            $app: resolve(__dirname, '../src/mocks/app/'),
          },
        },
      }),
  } satisfies Plugin;
}
