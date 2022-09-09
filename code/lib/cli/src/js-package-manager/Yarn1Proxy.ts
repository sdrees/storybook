import { JsPackageManager } from './JsPackageManager';
import type { PackageJson } from './PackageJson';

export class Yarn1Proxy extends JsPackageManager {
  readonly type = 'yarn1';

  initPackageJson() {
    return this.executeCommand('yarn', ['init', '-y']);
  }

  getRunStorybookCommand(): string {
    return 'yarn storybook';
  }

  getRunCommand(command: string): string {
    return `yarn ${command}`;
  }

  protected getResolutions(packageJson: PackageJson, versions: Record<string, string>) {
    return {
      resolutions: {
        ...packageJson.resolutions,
        ...versions,
      },
    };
  }

  protected runInstall(): void {
    this.executeCommand('yarn', [], 'inherit');
  }

  protected runAddDeps(dependencies: string[], installAsDevDependencies: boolean): void {
    let args = ['--ignore-workspace-root-check', ...dependencies];

    if (installAsDevDependencies) {
      args = ['-D', ...args];
    }

    this.executeCommand('yarn', ['add', ...args], 'inherit');
  }

  protected runRemoveDeps(dependencies: string[]): void {
    const args = ['--ignore-workspace-root-check', ...dependencies];

    this.executeCommand('yarn', ['remove', ...args], 'inherit');
  }

  protected runGetVersions<T extends boolean>(
    packageName: string,
    fetchAllVersions: T
  ): Promise<T extends true ? string[] : string> {
    const args = [fetchAllVersions ? 'versions' : 'version', '--json'];

    const commandResult = this.executeCommand('yarn', ['info', packageName, ...args]);

    try {
      const parsedOutput = JSON.parse(commandResult);
      if (parsedOutput.type === 'inspect') {
        return parsedOutput.data;
      }
      throw new Error(`Unable to find versions of ${packageName} using yarn`);
    } catch (e) {
      throw new Error(`Unable to find versions of ${packageName} using yarn`);
    }
  }
}
