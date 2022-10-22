import global from 'global';
import configure from '../configure';
import type { Loader } from '../Loader';
import type { StoryshotsOptions } from '../../api/StoryshotsOptions';

function test(options: StoryshotsOptions): boolean {
  return options.framework === 'html';
}

function load(options: StoryshotsOptions) {
  global.STORYBOOK_ENV = 'html';

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
    framework: 'html' as const,
    renderTree: jest.requireActual('./renderTree').default,
    renderShallowTree: () => {
      throw new Error('Shallow renderer is not supported for HTML');
    },
    storybook: api,
  };
}

const htmLoader: Loader = {
  load,
  test,
};

export default htmLoader;
