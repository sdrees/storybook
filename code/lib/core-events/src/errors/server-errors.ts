import dedent from 'ts-dedent';
import { StorybookError } from './storybook-error';

/**
 * If you can't find a suitable category for your error, create one
 * based on the package name/file path of which the error is thrown.
 * For instance:
 * If it's from @storybook/node-logger, then NODE-LOGGER
 * If it's from a package that is too broad, e.g. @storybook/cli in the init command, then use a combination like CLI_INIT
 */
export enum Category {
  CLI = 'CLI',
  CLI_INIT = 'CLI_INIT',
  CLI_AUTOMIGRATE = 'CLI_AUTOMIGRATE',
  CLI_UPGRADE = 'CLI_UPGRADE',
  CLI_ADD = 'CLI_ADD',
  CODEMOD = 'CODEMOD',
  CORE_SERVER = 'CORE-SERVER',
  CSF_PLUGIN = 'CSF-PLUGIN',
  CSF_TOOLS = 'CSF-TOOLS',
  CORE_COMMON = 'CORE-COMMON',
  NODE_LOGGER = 'NODE-LOGGER',
  TELEMETRY = 'TELEMETRY',
  BUILDER_MANAGER = 'BUILDER-MANAGER',
  BUILDER_VITE = 'BUILDER-VITE',
  BUILDER_WEBPACK5 = 'BUILDER-WEBPACK5',
  SOURCE_LOADER = 'SOURCE-LOADER',
  POSTINSTALL = 'POSTINSTALL',
  DOCS_TOOLS = 'DOCS-TOOLS',
  CORE_WEBPACK = 'CORE-WEBPACK',
}

export class NxProjectDetectedError extends StorybookError {
  readonly category = Category.CLI_INIT;

  readonly code = 1;

  public readonly documentation = 'https://nx.dev/packages/storybook';

  template() {
    return dedent`
      We have detected Nx in your project. Nx has its own Storybook initializer, so please use it instead.
      Run "nx g @nx/storybook:configuration" to add Storybook to your project.
    `;
  }
}

export class MissingFrameworkFieldError extends StorybookError {
  readonly category = Category.CORE_COMMON;

  readonly code = 1;

  public readonly documentation =
    'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#new-framework-api';

  template() {
    return dedent`
      Could not find a 'framework' field in Storybook config.

      Please run 'npx storybook@next automigrate' to automatically fix your config.
    `;
  }
}

export class InvalidFrameworkNameError extends StorybookError {
  readonly category = Category.CORE_COMMON;

  readonly code = 2;

  public readonly documentation =
    'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#new-framework-api';

  constructor(public data: { frameworkName: string }) {
    super();
  }

  template() {
    return dedent`
      Invalid value of '${this.data.frameworkName}' in the 'framework' field of Storybook config.

      Please run 'npx storybook@next automigrate' to automatically fix your config.
    `;
  }
}

export class CouldNotEvaluateFrameworkError extends StorybookError {
  readonly category = Category.CORE_COMMON;

  readonly code = 3;

  constructor(public data: { frameworkName: string }) {
    super();
  }

  template() {
    return dedent`
      Could not evaluate the '${this.data.frameworkName}' package from the 'framework' field of Storybook config.

      Are you sure it's a valid package and is installed?
    `;
  }
}

export class ConflictingStaticDirConfigError extends StorybookError {
  readonly category = Category.CORE_SERVER;

  readonly code = 1;

  public readonly documentation =
    'https://storybook.js.org/docs/react/configure/images-and-assets#serving-static-files-via-storybook-configuration';

  template() {
    return dedent`
      Storybook encountered a conflict when trying to serve statics. You have configured both:
      * Storybook's option in the config file: 'staticDirs'
      * Storybook's (deprecated) CLI flag: '--staticDir' or '-s'
      
      Please remove the CLI flag from your storybook script and use only the 'staticDirs' option instead.
    `;
  }
}

export class InvalidStoriesEntryError extends StorybookError {
  readonly category = Category.CORE_COMMON;

  readonly code = 4;

  public readonly documentation =
    'https://storybook.js.org/docs/react/faq#can-i-have-a-storybook-with-no-local-stories';

  template() {
    return dedent`
      Storybook could not index your stories.
      Your main configuration somehow does not contain a 'stories' field, or it resolved to an empty array.

      Please check your main configuration file and make sure it exports a 'stories' field that is not an empty array.
    `;
  }
}
