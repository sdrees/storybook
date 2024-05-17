import { Options as CoreOptions } from '@storybook/types';

import { BuilderContext } from '@angular-devkit/architect';
import { AngularBuilderOptions } from '../builders/utils/setup';

export type PresetOptions = CoreOptions & {
  /* Allow to get the options of a targeted "browser builder"  */
  angularBrowserTarget?: string | null;
  /* Defined set of options. These will take over priority from angularBrowserTarget options  */
  angularBuilderOptions?: AngularBuilderOptions;
  /* Angular context from builder */
  angularBuilderContext?: BuilderContext | null;
  tsConfig?: string;
};
