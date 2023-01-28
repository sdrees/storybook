import type { NpmOptions } from '../NpmOptions';
import type { SupportedLanguage, Builder, ProjectType } from '../project_types';
import type { JsPackageManager } from '../js-package-manager/JsPackageManager';
import { type PackageManagerName } from '../js-package-manager/JsPackageManager';
import type { FrameworkPreviewParts } from './configure';

export type GeneratorOptions = {
  language: SupportedLanguage;
  builder: Builder;
  linkable: boolean;
  pnp: boolean;
  commonJs: boolean;
  frameworkPreviewParts?: FrameworkPreviewParts;
};

export interface FrameworkOptions {
  extraPackages?: string[];
  extraAddons?: string[];
  staticDir?: string;
  addScripts?: boolean;
  addMainFile?: boolean;
  addComponents?: boolean;
  addBabel?: boolean;
  addESLint?: boolean;
  extraMain?: any;
  extensions?: string[];
  framework?: Record<string, any>;
  commonJs?: boolean;
  storybookConfigFolder?: string;
  componentsDestinationPath?: string;
}

export type Generator<T = void> = (
  packageManagerInstance: JsPackageManager,
  npmOptions: NpmOptions,
  generatorOptions: GeneratorOptions,
  commandOptions?: CommandOptions
) => Promise<T>;

export type CommandOptions = {
  packageManager: PackageManagerName;
  useNpm?: boolean;
  usePnp?: boolean;
  type?: ProjectType;
  force?: any;
  html?: boolean;
  skipInstall?: boolean;
  parser?: string;
  // Automatically answer yes to prompts
  yes?: boolean;
  builder?: Builder;
  linkable?: boolean;
  commonJs?: boolean;
  disableTelemetry?: boolean;
  enableCrashReports?: boolean;
  debug?: boolean;
};
