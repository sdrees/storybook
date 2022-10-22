import { sync as spawnSync } from 'cross-spawn';
import { sync as findUpSync } from 'find-up';
import { NPMProxy } from './NPMProxy';
import { PNPMProxy } from './PNPMProxy';
import { JsPackageManager, type PackageManagerName } from './JsPackageManager';
import { Yarn2Proxy } from './Yarn2Proxy';
import { Yarn1Proxy } from './Yarn1Proxy';

export class JsPackageManagerFactory {
  public static getPackageManager(
    { force, useNpm }: { force?: PackageManagerName; useNpm?: boolean } = {},
    cwd?: string
  ): JsPackageManager {
    if (useNpm || force === 'npm') {
      return new NPMProxy({ cwd });
    }
    if (force === 'pnpm') {
      return new PNPMProxy({ cwd });
    }
    if (force === 'yarn1') {
      return new Yarn1Proxy({ cwd });
    }
    if (force === 'yarn2') {
      return new Yarn2Proxy({ cwd });
    }

    const yarnVersion = getYarnVersion(cwd);
    const hasYarnLockFile = Boolean(findUpSync('yarn.lock', { cwd }));
    const hasPNPMLockFile = Boolean(findUpSync('pnpm-lock.yaml', { cwd }));

    const hasNPMCommand = hasNPM(cwd);
    const hasPNPMCommand = hasPNPM(cwd);

    if (yarnVersion && (hasYarnLockFile || (!hasNPMCommand && !hasPNPMCommand))) {
      return yarnVersion === 1 ? new Yarn1Proxy({ cwd }) : new Yarn2Proxy({ cwd });
    }

    if (hasPNPMCommand && hasPNPMLockFile) {
      return new PNPMProxy({ cwd });
    }

    if (hasNPMCommand) {
      return new NPMProxy({ cwd });
    }

    throw new Error('Unable to find a usable package manager within NPM, PNPM, Yarn and Yarn 2');
  }
}

function hasNPM(cwd?: string) {
  const npmVersionCommand = spawnSync('npm', ['--version'], { cwd, shell: true });
  return npmVersionCommand.status === 0;
}

function hasPNPM(cwd?: string) {
  const pnpmVersionCommand = spawnSync('pnpm', ['--version'], { cwd, shell: true });
  return pnpmVersionCommand.status === 0;
}

function getYarnVersion(cwd?: string): 1 | 2 | undefined {
  const yarnVersionCommand = spawnSync('yarn', ['--version'], { cwd, shell: true });

  if (yarnVersionCommand.status !== 0) {
    return undefined;
  }

  const yarnVersion = yarnVersionCommand.output.toString().replace(/,/g, '').replace(/"/g, '');

  return /^1\.+/.test(yarnVersion) ? 1 : 2;
}
