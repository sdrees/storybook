/// <reference types="webpack-env" />

import './client/preview';

// optimization: stop HMR propagation in webpack
if (typeof module !== 'undefined') module?.hot?.decline();
