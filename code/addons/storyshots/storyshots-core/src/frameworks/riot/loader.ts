import global from 'global';
import hasDependency from '../hasDependency';
import configure from '../configure';
import type { Loader } from '../Loader';
import type { StoryshotsOptions } from '../../api/StoryshotsOptions';

function mockRiotToIncludeCompiler() {
  jest.mock('riot', () => jest.requireActual('riot/riot.js'));
}

function test(options: StoryshotsOptions): boolean {
  return options.framework === 'riot' || (!options.framework && hasDependency('@storybook/riot'));
}

function load(options: StoryshotsOptions) {
  global.STORYBOOK_ENV = 'riot';
  mockRiotToIncludeCompiler();

  const storybook = jest.requireActual('@storybook/riot');
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
    framework: 'riot' as const,
    renderTree: jest.requireActual('./renderTree').default,
    renderShallowTree: () => {
      throw new Error('Shallow renderer is not supported for riot');
    },
    storybook: api,
  };
}

const riotLoader: Loader = {
  load,
  test,
};

export default riotLoader;
