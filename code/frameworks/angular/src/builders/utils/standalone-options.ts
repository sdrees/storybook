import { BuilderContext } from '@angular-devkit/architect';

import { LoadOptions, CLIOptions, BuilderOptions } from '@storybook/types';
import { AngularBuilderOptions } from '../../server/framework-preset-angular-cli';

export type StandaloneOptions = CLIOptions &
  LoadOptions &
  BuilderOptions & {
    mode?: 'static' | 'dev';
    enableProdMode: boolean;
    angularBrowserTarget?: string | null;
    angularBuilderOptions?: AngularBuilderOptions;
    angularBuilderContext?: BuilderContext | null;
    tsConfig?: string;
    excludeChunks?: string[];
  };
