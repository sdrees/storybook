import type { BuilderOptions, StorybookConfigVite } from '@storybook/builder-vite';
import type { StorybookConfig as StorybookConfigBase } from '@storybook/types';

type FrameworkName = '@storybook/vue3-vite';
type BuilderName = '@storybook/builder-vite';

export type FrameworkOptions = {
  builder?: BuilderOptions;
  /**
   * Plugin to use for generation docs for component props, events, slots and exposes.
   * Since Storybook 8, the official vue plugin "vue-component-meta" (Volar) can be used which supports
   * more complex types, better type docs, support for js(x)/ts(x) components and more.
   *
   * "vue-component-meta" will become the new default in the future and "vue-docgen-api" will be removed.
   * @default "vue-docgen-api"
   */
  docgen?: 'vue-docgen-api' | 'vue-component-meta';
};

type StorybookConfigFramework = {
  framework:
    | FrameworkName
    | {
        name: FrameworkName;
        options: FrameworkOptions;
      };
  core?: StorybookConfigBase['core'] & {
    builder?:
      | BuilderName
      | {
          name: BuilderName;
          options: BuilderOptions;
        };
  };
};

/**
 * The interface for Storybook configuration in `main.ts` files.
 */
export type StorybookConfig = Omit<
  StorybookConfigBase,
  keyof StorybookConfigVite | keyof StorybookConfigFramework
> &
  StorybookConfigVite &
  StorybookConfigFramework;
