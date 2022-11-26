const path = require('path');

module.exports = {
  displayName: __dirname.split(path.sep).slice(-2).join(path.posix.sep),
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  transformIgnorePatterns: ['/node_modules/(?!@angular|rxjs|nanoid|uuid)'],
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
};
