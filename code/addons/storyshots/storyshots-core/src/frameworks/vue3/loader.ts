import global from 'global';
import hasDependency from '../hasDependency';
import configure from '../configure';
import type { Loader } from '../Loader';
import type { StoryshotsOptions } from '../../api/StoryshotsOptions';

function test(options: StoryshotsOptions): boolean {
  return options.framework === 'vue3' || (!options.framework && hasDependency('@storybook/vue3'));
}

function load(options: StoryshotsOptions) {
  global.STORYBOOK_ENV = 'vue3';

  const storybook = jest.requireActual('@storybook/vue');
  const clientAPI = jest.requireActual('@storybook/client-api');

  const api = {
    ...clientAPI,
    ...storybook,
  };

  configure({
    ...options,
    storybook: api,
  });

  return {
    framework: 'vue3' as const,
    renderTree: jest.requireActual('./renderTree').default,
    renderShallowTree: () => {
      throw new Error('Shallow renderer is not supported for Vue 3');
    },
    storybook: api,
  };
}

const vueLoader: Loader = {
  load,
  test,
};

export default vueLoader;
