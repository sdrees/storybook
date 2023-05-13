import { JsPackageManager } from './JsPackageManager';
import type { PackageJson } from './PackageJson';
import type { InstallationMetadata, PackageMetadata } from './types';
import { parsePackageData } from './util';

type Yarn1ListItem = {
  name: string;
  children: Yarn1ListItem[];
};

type Yarn1ListData = {
  type: 'list';
  trees: Yarn1ListItem[];
};

export type Yarn1ListOutput = {
  type: 'tree';
  data: Yarn1ListData;
};

export class Yarn1Proxy extends JsPackageManager {
  readonly type = 'yarn1';

  installArgs: string[] | undefined;

  getInstallArgs(): string[] {
    if (!this.installArgs) {
      this.installArgs = ['--ignore-workspace-root-check'];
    }
    return this.installArgs;
  }

  async initPackageJson() {
    await this.executeCommand({ command: 'yarn', args: ['init', '-y'] });
  }

  getRunStorybookCommand(): string {
    return 'yarn storybook';
  }

  getRunCommand(command: string): string {
    return `yarn ${command}`;
  }

  public runPackageCommandSync(
    command: string,
    args: string[],
    cwd?: string,
    stdio?: 'pipe' | 'inherit'
  ): string {
    return this.executeCommandSync({ command: `yarn`, args: [command, ...args], cwd, stdio });
  }

  async runPackageCommand(command: string, args: string[], cwd?: string): Promise<string> {
    return this.executeCommand({ command: `yarn`, args: [command, ...args], cwd });
  }

  public async findInstallations(pattern: string[]) {
    const commandResult = await this.executeCommand({
      command: 'yarn',
      args: ['list', '--pattern', pattern.map((p) => `"${p}"`).join(' '), '--recursive', '--json'],
    });

    try {
      const parsedOutput = JSON.parse(commandResult);
      return this.mapDependencies(parsedOutput);
    } catch (e) {
      return undefined;
    }
  }

  protected getResolutions(packageJson: PackageJson, versions: Record<string, string>) {
    return {
      resolutions: {
        ...packageJson.resolutions,
        ...versions,
      },
    };
  }

  protected async runInstall() {
    await this.executeCommand({
      command: 'yarn',
      args: ['install', ...this.getInstallArgs()],
      stdio: 'inherit',
    });
  }

  protected async runAddDeps(dependencies: string[], installAsDevDependencies: boolean) {
    let args = [...dependencies];

    if (installAsDevDependencies) {
      args = ['-D', ...args];
    }

    await this.executeCommand({
      command: 'yarn',
      args: ['add', ...this.getInstallArgs(), ...args],
      stdio: 'inherit',
    });
  }

  protected async runRemoveDeps(dependencies: string[]) {
    const args = [...dependencies];

    await this.executeCommand({
      command: 'yarn',
      args: ['remove', ...this.getInstallArgs(), ...args],
      stdio: 'inherit',
    });
  }

  protected async runGetVersions<T extends boolean>(
    packageName: string,
    fetchAllVersions: T
  ): Promise<T extends true ? string[] : string> {
    const args = [fetchAllVersions ? 'versions' : 'version', '--json'];

    const commandResult = await this.executeCommand({
      command: 'yarn',
      args: ['info', packageName, ...args],
    });

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

  protected mapDependencies(input: Yarn1ListOutput): InstallationMetadata {
    if (input.type === 'tree') {
      const { trees } = input.data;
      const acc: Record<string, PackageMetadata[]> = {};
      const existingVersions: Record<string, string[]> = {};
      const duplicatedDependencies: Record<string, string[]> = {};

      const recurse = (tree: typeof trees[0]) => {
        const { children } = tree;
        const { name, value } = parsePackageData(tree.name);
        if (!name || !name.includes('storybook')) return;
        if (!existingVersions[name]?.includes(value.version)) {
          if (acc[name]) {
            acc[name].push(value);
          } else {
            acc[name] = [value];
          }
          existingVersions[name] = [...(existingVersions[name] || []), value.version];

          if (existingVersions[name].length > 1) {
            duplicatedDependencies[name] = existingVersions[name];
          }
        }

        children.forEach(recurse);
      };

      trees.forEach(recurse);

      return {
        dependencies: acc,
        duplicatedDependencies,
        infoCommand: 'yarn why',
      };
    }

    throw new Error('Something went wrong while parsing yarn output');
  }
}
