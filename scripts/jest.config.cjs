module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: false,
            decorators: false,
            dynamicImport: false,
          },
          experimental: {
            plugins: [['jest_workaround', {}]],
          },
        },
      },
    ],
  },
  transformIgnorePatterns: [],
};
