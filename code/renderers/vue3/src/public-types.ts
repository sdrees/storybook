import type {
  AnnotatedStoryFn,
  Args,
  ArgsFromMeta,
  ArgsStoryFn,
  ComponentAnnotations,
  DecoratorFunction,
  StoryAnnotations,
} from '@storybook/types';

import type { SetOptional, Simplify } from 'type-fest';
import type { ComponentOptions, ConcreteComponent, FunctionalComponent } from 'vue';
import type { VueFramework } from './types';

/**
 * Metadata to configure the stories for a component.
 *
 * @see [Default export](https://storybook.js.org/docs/formats/component-story-format/#default-export)
 */
export type Meta<TCmpOrArgs = Args> = ComponentAnnotations<
  VueFramework,
  ComponentPropsOrProps<TCmpOrArgs>
>;

/**
 * Story function that represents a CSFv2 component example.
 *
 * @see [Named Story exports](https://storybook.js.org/docs/formats/component-story-format/#named-story-exports)
 */
export type StoryFn<TCmpOrArgs = Args> = AnnotatedStoryFn<
  VueFramework,
  ComponentPropsOrProps<TCmpOrArgs>
>;

/**
 * Story function that represents a CSFv3 component example.
 *
 * @see [Named Story exports](https://storybook.js.org/docs/formats/component-story-format/#named-story-exports)
 */
export type StoryObj<TMetaOrCmpOrArgs = Args> = TMetaOrCmpOrArgs extends {
  render?: ArgsStoryFn<VueFramework, any>;
  component?: infer Component;
  args?: infer DefaultArgs;
}
  ? Simplify<
      ComponentProps<Component> & ArgsFromMeta<VueFramework, TMetaOrCmpOrArgs>
    > extends infer TArgs
    ? StoryAnnotations<
        VueFramework,
        TArgs,
        SetOptional<TArgs, Extract<keyof TArgs, keyof DefaultArgs>>
      >
    : never
  : StoryAnnotations<VueFramework, ComponentPropsOrProps<TMetaOrCmpOrArgs>>;

type ComponentProps<C> = C extends ComponentOptions<infer P>
  ? P
  : C extends FunctionalComponent<infer P>
  ? P
  : unknown;

type ComponentPropsOrProps<TCmpOrArgs> = TCmpOrArgs extends ConcreteComponent<any>
  ? unknown extends ComponentProps<TCmpOrArgs>
    ? TCmpOrArgs
    : ComponentProps<TCmpOrArgs>
  : TCmpOrArgs;

/**
 * @deprecated Use `StoryFn` instead.
 * Use `StoryObj` if you want to migrate to CSF3, which uses objects instead of functions to represent stories.
 * You can read more about the CSF3 format here: https://storybook.js.org/blog/component-story-format-3-0/
 *
 * Story function that represents a CSFv2 component example.
 *
 * @see [Named Story exports](https://storybook.js.org/docs/formats/component-story-format/#named-story-exports)
 */
export type Story<TArgs = Args> = StoryFn<TArgs>;

export type DecoratorFn<TArgs = Args> = DecoratorFunction<VueFramework, TArgs>;
