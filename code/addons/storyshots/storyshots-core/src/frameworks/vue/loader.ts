import global from 'global';
import hasDependency from '../hasDependency';
import configure from '../configure';
import type { Loader } from '../Loader';
import type { StoryshotsOptions } from '../../api/StoryshotsOptions';

function mockVueToIncludeCompiler() {
  jest.mock('vue', () => jest.requireActual('vue/dist/vue.common.js'));
}

function test(options: StoryshotsOptions): boolean {
  return options.framework === 'vue' || (!options.framework && hasDependency('@storybook/vue'));
}

function load(options: StoryshotsOptions) {
  global.STORYBOOK_ENV = 'vue';
  mockVueToIncludeCompiler();

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
    framework: 'vue' as const,
    renderTree: jest.requireActual('./renderTree').default,
    renderShallowTree: () => {
      throw new Error('Shallow renderer is not supported for vue');
    },
    storybook: api,
  };
}

const vueLoader: Loader = {
  load,
  test,
};

export default vueLoader;
