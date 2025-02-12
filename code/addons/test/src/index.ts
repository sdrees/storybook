import type { storybookTest as storybookTestImport } from './vitest-plugin';

// make it work with --isolatedModules
export default {};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore-error - this is a hack to make the module's sub-path augmentable
declare module '@storybook/experimental-addon-test/vitest-plugin' {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore-error - this is a hack to make the module's sub-path augmentable
  export const storybookTest: typeof storybookTestImport;
}
