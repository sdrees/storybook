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

  let mockStartedAPI: any;

  jest.mock('@storybook/preview-api', () => {
    const previewAPI = jest.requireActual('@storybook/preview-api');

    return {
      ...previewAPI,
      start: (...args: any[]) => {
        mockStartedAPI = previewAPI.start(...args);
        return mockStartedAPI;
      },
    };
  });

  jest.mock('@storybook/riot', () => {
    const renderAPI = jest.requireActual('@storybook/riot');

    renderAPI.addDecorator = mockStartedAPI.clientApi.addDecorator;
    renderAPI.addParameters = mockStartedAPI.clientApi.addParameters;

    return renderAPI;
  });

  // eslint-disable-next-line global-require
  const storybook = require('@storybook/riot');

  configure({
    ...options,
    storybook,
  });

  return {
    framework: 'riot' as const,
    renderTree: jest.requireActual('./renderTree').default,
    renderShallowTree: () => {
      throw new Error('Shallow renderer is not supported for riot');
    },
    storybook,
  };
}

const riotLoader: Loader = {
  load,
  test,
};

export default riotLoader;
