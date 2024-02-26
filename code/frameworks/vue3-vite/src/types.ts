import type { BuilderOptions, StorybookConfigVite } from '@storybook/builder-vite';
import type { StorybookConfig as StorybookConfigBase } from '@storybook/types';
import type { ComponentMeta } from 'vue-component-meta';
import type { ComponentDoc } from 'vue-docgen-api';

type FrameworkName = '@storybook/vue3-vite';
type BuilderName = '@storybook/builder-vite';

/**
 * Available docgen plugins for vue.
 */
export type VueDocgenPlugin = 'vue-docgen-api' | 'vue-component-meta';

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
  docgen?: VueDocgenPlugin;
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

/**
 * Gets the type of a single array element.
 */
type ArrayElement<T> = T extends readonly (infer A)[] ? A : never;

/**
 * Type of "__docgenInfo" depending on the used docgenPlugin.
 */
export type VueDocgenInfo<T extends VueDocgenPlugin> = T extends 'vue-component-meta'
  ? ComponentMeta
  : ComponentDoc;

/**
 * Single prop/event/slot/exposed entry of "__docgenInfo" depending on the used docgenPlugin.
 *
 * @example
 * ```ts
 * type PropInfo = VueDocgenInfoEntry<"vue-component-meta", "props">;
 * ```
 */
export type VueDocgenInfoEntry<
  T extends VueDocgenPlugin,
  TKey extends 'props' | 'events' | 'slots' | 'exposed' | 'expose' =
    | 'props'
    | 'events'
    | 'slots'
    | 'exposed'
    | 'expose',
> = ArrayElement<
  T extends 'vue-component-meta'
    ? VueDocgenInfo<'vue-component-meta'>[Exclude<TKey, 'expose'>]
    : VueDocgenInfo<'vue-docgen-api'>[Exclude<TKey, 'exposed'>]
>;
