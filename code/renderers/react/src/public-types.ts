import type {
  AnnotatedStoryFn,
  Args,
  ArgsStoryFn,
  ComponentAnnotations,
  LoaderFunction,
  StoryAnnotations,
} from '@storybook/csf';
import { SetOptional, Simplify, UnionToIntersection } from 'type-fest';
import { ComponentProps, ComponentType, JSXElementConstructor } from 'react';

import { ReactFramework } from './types';
import { DecoratorFn } from './public-api';

type JSXElement = keyof JSX.IntrinsicElements | JSXElementConstructor<any>;

/**
 * Metadata to configure the stories for a component.
 *
 * @see [Default export](https://storybook.js.org/docs/formats/component-story-format/#default-export)
 */
export type Meta<CmpOrArgs = Args> = CmpOrArgs extends ComponentType<infer CmpArgs>
  ? ComponentAnnotations<ReactFramework, CmpArgs>
  : ComponentAnnotations<ReactFramework, CmpOrArgs>;

/**
 * Story function that represents a CSFv2 component example.
 *
 * @see [Named Story exports](https://storybook.js.org/docs/formats/component-story-format/#named-story-exports)
 */
export type StoryFn<TArgs = Args> = AnnotatedStoryFn<ReactFramework, TArgs>;

/**
 * Story function that represents a CSFv3 component example.
 *
 * @see [Named Story exports](https://storybook.js.org/docs/formats/component-story-format/#named-story-exports)
 */

export type StoryObj<MetaOrArgs = Args> = MetaOrArgs extends {
  render?: ArgsStoryFn<ReactFramework, infer RArgs>;
  component?: ComponentType<infer CmpArgs>;
  loaders?: (infer Loaders)[];
  args?: infer DefaultArgs;
  decorators?: (infer Decorators)[];
}
  ? Simplify<CmpArgs & RArgs & DecoratorsArgs<Decorators> & LoaderArgs<Loaders>> extends infer TArgs
    ? StoryAnnotations<
        ReactFramework,
        TArgs,
        SetOptional<TArgs, Extract<keyof TArgs, keyof (DefaultArgs & ActionArgs<TArgs>)>>
      >
    : never
  : StoryAnnotations<ReactFramework, MetaOrArgs>;

type DecoratorsArgs<Decorators> = UnionToIntersection<
  Decorators extends DecoratorFn<infer Args> ? Args : unknown
>;

type LoaderArgs<Loaders> = UnionToIntersection<
  Loaders extends LoaderFunction<ReactFramework, infer Args> ? Args : unknown
>;

type ActionArgs<Args> = {
  [P in keyof Args as ((...args: any[]) => void) extends Args[P] ? P : never]: Args[P];
};

/**
 * @deprecated Use `Meta` instead.
 * For the common case where a component's stories are simple components that receives args as props:
 *
 * ```tsx
 * export default { ... } as ComponentMeta<typeof Button>;
 * ```
 */
export type ComponentMeta<T extends JSXElement> = Meta<ComponentProps<T>>;

/**
 * For the common case where a (CSFv2) story is a simple component that receives args as props:
 *
 * ```tsx
 * const Template: ComponentStoryFn<typeof Button> = (args) => <Button {...args} />
 * ```
 */
export type ComponentStoryFn<T extends JSXElement> = StoryFn<ComponentProps<T>>;

/**
 * @deprecated Use `StoryObj` instead.
 *
 * For the common case where a (CSFv3) story is a simple component that receives args as props:
 *
 * ```tsx
 * const MyStory: ComponentStoryObj<typeof Button> = {
 *   args: { buttonArg1: 'val' },
 * }
 * ```
 */
export type ComponentStoryObj<T extends JSXElement> = StoryObj<ComponentProps<T>>;

/**

 /**
 * @deprecated Use `StoryObj` instead.
 *
 * Story function that represents a CSFv3 component example.
 *
 * @see [Named Story exports](https://storybook.js.org/docs/formats/component-story-format/#named-story-exports)
 */
export type Story<TArgs = Args> = StoryFn<TArgs>;

/**
 * @deprecated Use StoryObj instead.
 *
 * For the common case where a (CSFv3) story is a simple component that receives args as props:
 *
 * ```tsx
 * const MyStory: ComponentStory<typeof Button> = {
 *   args: { buttonArg1: 'val' },
 * }
 * ```
 */
export type ComponentStory<T extends JSXElement> = ComponentStoryObj<T>;
