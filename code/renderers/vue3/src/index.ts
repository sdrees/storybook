/// <reference types="webpack-env" />

import './globals';

export * from './public-types';
export { setup } from './render';

// optimization: stop HMR propagation in webpack
try {
  if (module?.hot?.decline) {
    module.hot.decline();
  }
} catch (e) {
  /* do nothing */
}
