/// <reference types="webpack-env" />

import './globals';

export { setup } from './render';
export * from './public-types';
export * from './testing-api';

// optimization: stop HMR propagation in webpack
try {
  if (module?.hot?.decline) {
    module.hot.decline();
  }
} catch (e) {
  /* do nothing */
}
