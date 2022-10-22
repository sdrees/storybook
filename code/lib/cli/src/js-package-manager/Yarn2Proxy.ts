import { JsPackageManager } from './JsPackageManager';
import type { PackageJson } from './PackageJson';

// This encompasses both yarn 2 and yarn 3
export class Yarn2Proxy extends JsPackageManager {
  readonly type = 'yarn2';

  initPackageJson() {
    return this.executeCommand('yarn', ['init']);
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
    let args = [...dependencies];

    if (installAsDevDependencies) {
      args = ['-D', ...args];
    }

    this.executeCommand('yarn', ['add', ...args], 'inherit');
  }

  protected runRemoveDeps(dependencies: string[]): void {
    const args = [...dependencies];

    this.executeCommand('yarn', ['remove', ...args], 'inherit');
  }

  protected runGetVersions<T extends boolean>(
    packageName: string,
    fetchAllVersions: T
  ): Promise<T extends true ? string[] : string> {
    const field = fetchAllVersions ? 'versions' : 'version';
    const args = ['--fields', field, '--json'];

    const commandResult = this.executeCommand('yarn', ['npm', 'info', packageName, ...args]);

    try {
      const parsedOutput = JSON.parse(commandResult);
      return parsedOutput[field];
    } catch (e) {
      throw new Error(`Unable to find versions of ${packageName} using yarn 2`);
    }
  }
}
