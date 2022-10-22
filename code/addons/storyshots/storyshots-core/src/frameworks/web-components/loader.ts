import global from 'global';
import configure from '../configure';
import type { Loader } from '../Loader';
import type { StoryshotsOptions } from '../../api/StoryshotsOptions';

function test(options: StoryshotsOptions): boolean {
  return options.framework === 'web-components';
}

function load(options: StoryshotsOptions) {
  global.STORYBOOK_ENV = 'web-components';

  const storybook = jest.requireActual('@storybook/html');
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
    framework: 'web-components' as const,
    renderTree: jest.requireActual('./renderTree').default,
    renderShallowTree: () => {
      throw new Error('Shallow renderer is not supported for web-components');
    },
    storybook: api,
  };
}

const webComponentsLoader: Loader = {
  load,
  test,
};

export default webComponentsLoader;
