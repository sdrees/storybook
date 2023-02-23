import type { JsPackageManager } from '../js-package-manager';

export interface CheckOptions {
  packageManager: JsPackageManager;
  rendererPackage?: string;
  configDir?: string;
}

export interface RunOptions<ResultType> {
  packageManager: JsPackageManager;
  result: ResultType;
  dryRun?: boolean;
  mainConfigPath?: string;
  skipInstall?: boolean;
}

export interface Fix<ResultType = any> {
  id: string;
  promptOnly?: boolean;
  check: (options: CheckOptions) => Promise<ResultType | void>;
  prompt: (result: ResultType) => string;
  run?: (options: RunOptions<ResultType>) => Promise<void>;
}
