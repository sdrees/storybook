import { sync as spawnSync } from 'cross-spawn';
import { sync as findUpSync } from 'find-up';
import { NPMProxy } from './NPMProxy';
import { JsPackageManager } from './JsPackageManager';
import { Yarn2Proxy } from './Yarn2Proxy';
import { Yarn1Proxy } from './Yarn1Proxy';

export class JsPackageManagerFactory {
  public static getPackageManager(forceNpmUsage = false, cwd?: string): JsPackageManager {
    if (forceNpmUsage) {
      return new NPMProxy({ cwd });
    }

    const yarnVersion = getYarnVersion(cwd);
    const hasYarnLockFile = findUpSync('yarn.lock', { cwd });

    const hasNPMCommand = hasNPM(cwd);

    if (yarnVersion && (hasYarnLockFile || !hasNPMCommand)) {
      return yarnVersion === 1 ? new Yarn1Proxy({ cwd }) : new Yarn2Proxy({ cwd });
    }

    if (hasNPMCommand) {
      return new NPMProxy({ cwd });
    }

    throw new Error('Unable to find a usable package manager within NPM, Yarn and Yarn 2');
  }
}

function hasNPM(cwd?: string) {
  const npmVersionCommand = spawnSync('npm', ['--version'], { cwd, shell: true });
  return npmVersionCommand.status === 0;
}

function getYarnVersion(cwd?: string): 1 | 2 | undefined {
  const yarnVersionCommand = spawnSync('yarn', ['--version'], { cwd, shell: true });

  if (yarnVersionCommand.status !== 0) {
    return undefined;
  }

  const yarnVersion = yarnVersionCommand.output.toString().replace(/,/g, '').replace(/"/g, '');

  return /^1\.+/.test(yarnVersion) ? 1 : 2;
}
