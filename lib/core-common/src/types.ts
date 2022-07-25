import type { Options as TelejsonOptions } from 'telejson';
import type { TransformOptions } from '@babel/core';
import { Router } from 'express';
import { Server } from 'http';
import type { Parameters } from '@storybook/csf';
import type { FileSystemCache } from './utils/file-cache';

/**
 * ⚠️ This file contains internal WIP types they MUST NOT be exported outside this package for now!
 */

export type BuilderName = 'webpack5' | '@storybook/builder-webpack5' | string;

export interface CoreConfig {
  builder?:
    | BuilderName
    | {
        name: BuilderName;
        options?: Record<string, any>;
      };
  disableWebpackDefaults?: boolean;
  channelOptions?: Partial<TelejsonOptions>;
  /**
   * Disables the generation of project.json, a file containing Storybook metadata
   */
  disableProjectJson?: boolean;
  /**
   * Disables Storybook telemetry
   * @see https://storybook.js.org/telemetry
   */
  disableTelemetry?: boolean;
  /**
   * Enable crash reports to be sent to Storybook telemetry
   * @see https://storybook.js.org/telemetry
   */
  enableCrashReports?: boolean;
  /**
   * enable CORS headings to run document in a "secure context"
   * see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements
   * This enables these headers in development-mode:
   *   Cross-Origin-Opener-Policy: same-origin
   *   Cross-Origin-Embedder-Policy: require-corp
   */
  crossOriginIsolated?: boolean;
}

interface DirectoryMapping {
  from: string;
  to: string;
}

export interface Presets {
  apply(
    extension: 'typescript',
    config: TypescriptOptions,
    args?: Options
  ): Promise<TypescriptOptions>;
  apply(extension: 'framework', config?: {}, args?: any): Promise<Preset>;
  apply(extension: 'babel', config?: {}, args?: any): Promise<TransformOptions>;
  apply(extension: 'entries', config?: [], args?: any): Promise<unknown>;
  apply(extension: 'stories', config?: [], args?: any): Promise<StoriesEntry[]>;
  apply(extension: 'managerEntries', config: [], args?: any): Promise<string[]>;
  apply(extension: 'refs', config?: [], args?: any): Promise<unknown>;
  apply(extension: 'core', config?: {}, args?: any): Promise<CoreConfig>;
  apply<T>(extension: string, config?: T, args?: unknown): Promise<T>;
}

export interface LoadedPreset {
  name: string;
  preset: any;
  options: any;
}

export type PresetConfig =
  | string
  | {
      name: string;
      options?: unknown;
    };

export interface Ref {
  id: string;
  url: string;
  title: string;
  version: string;
  type?: string;
  disable?: boolean;
}

export interface VersionCheck {
  success: boolean;
  data?: any;
  error?: any;
  time: number;
}

export interface ReleaseNotesData {
  success: boolean;
  currentVersion: string;
  showOnFirstLaunch: boolean;
}

export interface Stats {
  toJson: () => any;
}

export interface BuilderResult {
  totalTime?: ReturnType<typeof process.hrtime>;
  stats?: Stats;
}

// TODO: this is a generic interface that we can share across multiple SB packages (like @storybook/cli)
export interface PackageJson {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  eslintConfig?: Record<string, any>;
  type?: 'module';
  [key: string]: any;
}

// TODO: This could be exported to the outside world and used in `options.ts` file of each `@storybook/APP`
// like it's described in docs/api/new-frameworks.md
export interface LoadOptions {
  packageJson: PackageJson;
  outputDir?: string;
  configDir?: string;
  ignorePreview?: boolean;
  extendServer?: (server: Server) => void;
}

export interface CLIOptions {
  port?: number;
  ignorePreview?: boolean;
  previewUrl?: string;
  forceBuildPreview?: boolean;
  disableTelemetry?: boolean;
  enableCrashReports?: boolean;
  host?: string;
  /**
   * @deprecated Use 'staticDirs' Storybook Configuration option instead
   */
  staticDir?: string[];
  configDir?: string;
  https?: boolean;
  sslCa?: string[];
  sslCert?: string;
  sslKey?: string;
  smokeTest?: boolean;
  managerCache?: boolean;
  open?: boolean;
  ci?: boolean;
  loglevel?: string;
  quiet?: boolean;
  versionUpdates?: boolean;
  releaseNotes?: boolean;
  dll?: boolean;
  docs?: boolean;
  docsDll?: boolean;
  uiDll?: boolean;
  debugWebpack?: boolean;
  webpackStatsJson?: string | boolean;
  outputDir?: string;
}

export interface BuilderOptions {
  configType?: 'DEVELOPMENT' | 'PRODUCTION';
  ignorePreview: boolean;
  cache: FileSystemCache;
  configDir: string;
  docsMode: boolean;
  features?: StorybookConfig['features'];
  versionCheck?: VersionCheck;
  releaseNotesData?: ReleaseNotesData;
  disableWebpackDefaults?: boolean;
  serverChannelUrl?: string;
}

export interface StorybookConfigOptions {
  presets: Presets;
  presetsList?: LoadedPreset[];
}

export type Options = LoadOptions & StorybookConfigOptions & CLIOptions & BuilderOptions;

export interface Builder<Config, BuilderStats extends Stats = Stats> {
  getConfig: (options: Options) => Promise<Config>;
  start: (args: {
    options: Options;
    startTime: ReturnType<typeof process.hrtime>;
    router: Router;
    server: Server;
  }) => Promise<void | {
    stats?: BuilderStats;
    totalTime: ReturnType<typeof process.hrtime>;
    bail: (e?: Error) => Promise<void>;
  }>;
  build: (arg: {
    options: Options;
    startTime: ReturnType<typeof process.hrtime>;
  }) => Promise<void | BuilderStats>;
  bail: (e?: Error) => Promise<void>;
  corePresets?: string[];
  overridePresets?: string[];
}

export interface IndexerOptions {
  makeTitle: (userTitle?: string) => string;
}

export interface IndexedStory {
  id: string;
  name: string;
  parameters?: Parameters;
}
export interface StoryIndex {
  meta: { title?: string };
  stories: IndexedStory[];
}

export interface StoryIndexer {
  test: RegExp;
  indexer: (fileName: string, options: IndexerOptions) => Promise<StoryIndex>;
  addDocsTemplate?: boolean;
}

/**
 * Options for TypeScript usage within Storybook.
 */
export interface TypescriptOptions {
  /**
   * Enables type checking within Storybook.
   *
   * @default `false`
   */
  check: boolean;
  /**
   * Disable parsing typescript files through babel.
   *
   * @default `false`
   */
  skipBabel: boolean;
}

interface StoriesSpecifier {
  /**
   * When auto-titling, what to prefix all generated titles with (default: '')
   */
  titlePrefix?: string;
  /**
   * Where to start looking for story files
   */
  directory: string;
  /**
   * What does the filename of a story file look like?
   * (a glob, relative to directory, no leading `./`)
   * If unset, we use `** / *.stories.@(mdx|tsx|ts|jsx|js)` (no spaces)
   */
  files?: string;
}

export type StoriesEntry = string | StoriesSpecifier;

export type NormalizedStoriesSpecifier = Required<StoriesSpecifier> & {
  /*
   * Match the "importPath" of a file (e.g. `./src/button/Button.stories.js')
   * relative to the current working directory.
   */
  importPathMatcher: RegExp;
};

export type Preset =
  | string
  | {
      name: string;
      options?: any;
    };

/**
 * An additional script that gets injected into the
 * preview or the manager,
 */
export type Entry = string;

type StorybookRefs = Record<string, { title: string; url: string } | { disable: boolean }>;

export type DocsOptions = {
  /**
   * Should we generate docs entries at all under any circumstances? (i.e. can they be rendered)
   */
  enabled?: boolean;
  /**
   * What should we call the generated docs entries?
   */
  defaultName?: string;
  /**
   * Should we generate a docs entry per CSF file?
   */
  docsPage?: boolean;
};

/**
 * The interface for Storybook configuration in `main.ts` files.
 */
export interface StorybookConfig {
  /**
   * Sets the addons you want to use with Storybook.
   *
   * @example `['@storybook/addon-essentials']` or `[{ name: '@storybook/addon-essentials', options: { backgrounds: false } }]`
   */
  addons?: Preset[];
  core?: CoreConfig;
  /**
   * Sets a list of directories of static files to be loaded by Storybook server
   *
   * @example `['./public']` or `[{from: './public', 'to': '/assets'}]`
   */
  staticDirs?: (DirectoryMapping | string)[];
  logLevel?: string;
  features?: {
    /**
     * Allows to disable deprecated implicit PostCSS loader. (will be removed in 7.0)
     */
    postcss?: boolean;

    /**
     * Build stories.json automatically on start/build
     */
    buildStoriesJson?: boolean;

    /**
     * Activate preview of CSF v3.0
     *
     * @deprecated This is always on now from 6.4 regardless of the setting
     */
    previewCsfV3?: boolean;

    /**
     * Activate on demand story store
     */
    storyStoreV7?: boolean;

    /**
     * Enable a set of planned breaking changes for SB7.0
     */
    breakingChangesV7?: boolean;

    /**
     * Enable the step debugger functionality in Addon-interactions.
     */
    interactionsDebugger?: boolean;

    /**
     * Use Storybook 7.0 babel config scheme
     */
    babelModeV7?: boolean;

    /**
     * Filter args with a "target" on the type from the render function (EXPERIMENTAL)
     */
    argTypeTargetsV7?: boolean;

    /**
     * Warn when there is a pre-6.0 hierarchy separator ('.' / '|') in the story title.
     * Will be removed in 7.0.
     */
    warnOnLegacyHierarchySeparator?: boolean;

    /**
     * Preview MDX2 support, will become default in 7.0
     */
    previewMdx2?: boolean;
  };

  /**
   * Tells Storybook where to find stories.
   *
   * @example `['./src/*.stories.@(j|t)sx?']`
   */
  stories: StoriesEntry[];

  /**
   * Framework, e.g. '@storybook/react', required in v7
   */
  framework?: Preset;

  /**
   * Controls how Storybook handles TypeScript files.
   */
  typescript?: Partial<TypescriptOptions>;

  /**
   * References external Storybooks
   */
  refs?: StorybookRefs | ((config: any, options: Options) => StorybookRefs);

  /**
   * Modify or return babel config.
   */
  babel?: (
    config: TransformOptions,
    options: Options
  ) => TransformOptions | Promise<TransformOptions>;

  /**
   * Modify or return babel config.
   */
  babelDefault?: (
    config: TransformOptions,
    options: Options
  ) => TransformOptions | Promise<TransformOptions>;

  /**
   * Add additional scripts to run in the preview a la `.storybook/preview.js`
   *
   * @deprecated use `previewAnnotations` or `/preview.js` file instead
   */
  config?: (entries: Entry[], options: Options) => Entry[];

  /**
   * Add additional scripts to run in the preview a la `.storybook/preview.js`
   */
  previewAnnotations?: (entries: Entry[], options: Options) => Entry[];

  /**
   * Process CSF files for the story index.
   */
  storyIndexers?: (indexers: StoryIndexer[], options: Options) => StoryIndexer[];

  /**
   * Docs related features in index generation
   */
  docs?: DocsOptions;
}

export type PresetProperty<K, TStorybookConfig = StorybookConfig> =
  | TStorybookConfig[K extends keyof TStorybookConfig ? K : never]
  | PresetPropertyFn<K, TStorybookConfig>;

export type PresetPropertyFn<K, TStorybookConfig = StorybookConfig, TOptions = {}> = (
  config: TStorybookConfig[K extends keyof TStorybookConfig ? K : never],
  options: Options & TOptions
) =>
  | TStorybookConfig[K extends keyof TStorybookConfig ? K : never]
  | Promise<TStorybookConfig[K extends keyof TStorybookConfig ? K : never]>;
