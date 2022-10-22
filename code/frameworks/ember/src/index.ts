/// <reference types="webpack-env" />

export { storiesOf, configure, forceReRender, raw } from './client/preview';

// optimization: stop HMR propagation in webpack
module?.hot?.decline();
