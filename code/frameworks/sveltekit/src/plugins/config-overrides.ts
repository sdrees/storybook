import type { Plugin } from 'vite';

export function configOverrides() {
  return {
    name: 'storybook:sveltekit-overrides',
    config: (conf) => {
      // Some versions of sveltekit set ssr, we need it to be false
      if (conf.build?.ssr) {
        // eslint-disable-next-line no-param-reassign
        conf.build.ssr = false;
      }
      return conf;
    },
  } satisfies Plugin;
}
