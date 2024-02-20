import type { StorybookConfigRaw } from '@storybook/types';
import type { JsPackageManager, PackageManagerName } from '@storybook/core-common';

export interface CheckOptions {
  packageManager: JsPackageManager;
  rendererPackage?: string;
  configDir?: string;
  mainConfig: StorybookConfigRaw;
  storybookVersion: string;
  previewConfigPath?: string;
  mainConfigPath?: string;
}

export interface RunOptions<ResultType> {
  packageManager: JsPackageManager;
  result: ResultType;
  dryRun?: boolean;
  mainConfigPath: string;
  skipInstall?: boolean;
}

/**
 * promptType defines how the user will be prompted to apply an automigration fix
 * - auto: the fix will be applied automatically
 * - manual: the user will be prompted to apply the fix
 * - notification: the user will be notified about the some changes. A fix isn't required
 */
export type Prompt = 'auto' | 'manual' | 'notification';

export interface Fix<ResultType = any> {
  id: string;
  promptType?: Prompt | ((result: ResultType) => Promise<Prompt> | Prompt);
  check: (options: CheckOptions) => Promise<ResultType | null>;
  prompt: (result: ResultType) => string;
  run?: (options: RunOptions<ResultType>) => Promise<void>;
}

export type FixId = string;

export enum PreCheckFailure {
  UNDETECTED_SB_VERSION = 'undetected_sb_version',
  MAINJS_NOT_FOUND = 'mainjs_not_found',
  MAINJS_EVALUATION = 'mainjs_evaluation_error',
}

export interface AutofixOptions extends Omit<AutofixOptionsFromCLI, 'packageManager'> {
  packageManager: JsPackageManager;
  mainConfigPath: string;
  storybookVersion: string;
}
export interface AutofixOptionsFromCLI {
  fixId?: FixId;
  list?: boolean;
  fixes?: Fix[];
  yes?: boolean;
  packageManager?: PackageManagerName;
  dryRun?: boolean;
  configDir: string;
  renderer?: string;
  skipInstall?: boolean;
  hideMigrationSummary?: boolean;
}

export enum FixStatus {
  CHECK_FAILED = 'check_failed',
  UNNECESSARY = 'unnecessary',
  MANUAL_SUCCEEDED = 'manual_succeeded',
  MANUAL_SKIPPED = 'manual_skipped',
  SKIPPED = 'skipped',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

export type FixSummary = {
  skipped: FixId[];
  manual: FixId[];
  succeeded: FixId[];
  failed: Record<FixId, string>;
};
