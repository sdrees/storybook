import type { WebFramework } from '@storybook/types';

export type { RenderContext } from '@storybook/types';

export interface ShowErrorArgs {
  title: string;
  description: string;
}

export interface OptionsArgs {
  template: any;
  context: any;
  element: any;
}

export interface EmberFramework extends WebFramework {
  component: any;
  storyResult: OptionsArgs;
}
