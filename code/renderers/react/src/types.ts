import type { ComponentType, ReactElement } from 'react';
import type { AnyFramework } from '@storybook/csf';

export type { RenderContext } from '@storybook/store';
export type { StoryContext } from '@storybook/csf';

export interface ReactFramework extends AnyFramework {
  component: ComponentType<this['T']>;
  storyResult: StoryFnReactReturnType;
}

export interface ShowErrorArgs {
  title: string;
  description: string;
}

export type StoryFnReactReturnType = ReactElement<unknown>;
