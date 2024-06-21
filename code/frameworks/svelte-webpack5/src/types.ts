import type {
  SvelteOptions,
  StorybookConfig as StorybookConfigBase,
  TypescriptOptions as TypescriptOptionsReact,
} from '@storybook/preset-svelte-webpack';
import type {
  StorybookConfigWebpack,
  BuilderOptions,
  TypescriptOptions as TypescriptOptionsBuilder,
} from '@storybook/builder-webpack5';
import type { CompatibleString } from 'storybook/types';

type FrameworkName = CompatibleString<'@storybook/svelte-webpack5'>;
type BuilderName = CompatibleString<'@storybook/builder-webpack5'>;

export type FrameworkOptions = SvelteOptions & {
  builder?: BuilderOptions;
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
  typescript?: Partial<TypescriptOptionsBuilder & TypescriptOptionsReact> &
    StorybookConfigBase['typescript'];
};

/**
 * The interface for Storybook configuration in `main.ts` files.
 */
export type StorybookConfig = Omit<
  StorybookConfigBase,
  keyof StorybookConfigWebpack | keyof StorybookConfigFramework
> &
  StorybookConfigWebpack &
  StorybookConfigFramework;
