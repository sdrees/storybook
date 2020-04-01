import { spawn, sync } from 'cross-spawn';
import { satisfies } from 'semver';

/**
 * Get latest version of the package available on npmjs.com.
 * If constraint is set then it returns a version satisfying it, otherwise the latest version available is returned.
 *
 * @param {Object} npmOptions Object containing a `useYarn: boolean` attribute
 * @param {string} packageName Name of the package
 * @param {Object} constraint Version range to use to constraint the returned version
 * @return {Promise<string>} Promise resolved with a version
 */
export function latestVersion(npmOptions, packageName, constraint) {
  let getPackageVersions;

  // TODO: Refactor things to hide the package manager details:
  // Create a `PackageManager` interface that expose some functions like `version`, `add` etc
  // and then create classes that handle the npm/yarn/yarn2 specific behavior
  if (npmOptions.useYarn) {
    const yarnVersion = sync('yarn', ['--version'], { silent: true })
      .output.toString('utf8')
      .replace(/,/g, '')
      .replace(/"/g, '');

    if (/^1\.+/.test(yarnVersion)) {
      getPackageVersions = spawnVersionsWithYarn(packageName, constraint);
    } else {
      getPackageVersions = spawnVersionsWithYarn2(packageName, constraint);
    }
  } else {
    getPackageVersions = spawnVersionsWithNpm(packageName, constraint);
  }

  return getPackageVersions.then((versions) => {
    if (!constraint) return versions;

    return versions.reverse().find((version) => satisfies(version, constraint));
  });
}

/**
 *  Get latest version(s) of the package available on npmjs.com using NPM
 *
 * @param {string} packageName Name of the package
 * @param {Object} constraint Version range to use to constraint the returned version
 * @returns {Promise<string|Array<string>>} versions  Promise resolved with a version or an array of versions
 */
function spawnVersionsWithNpm(packageName, constraint) {
  return new Promise((resolve, reject) => {
    const command = spawn(
      'npm',
      ['info', packageName, constraint ? 'versions' : 'version', '--json', '--silent'],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'pipe',
        encoding: 'utf-8',
        silent: true,
      }
    );

    command.stdout.on('data', (data) => {
      try {
        const info = JSON.parse(data);
        if (info.error) {
          reject(new Error(info.error.summary));
        } else {
          resolve(info);
        }
      } catch (e) {
        reject(new Error(`Unable to find versions of ${packageName} using npm`));
      }
    });
  });
}

/**
 *  Get latest version(s) of the package available on npmjs.com using Yarn
 *
 * @param {string} packageName Name of the package
 * @param {Object} constraint Version range to use to constraint the returned version
 * @returns {Promise<string|Array<string>>} versions  Promise resolved with a version or an array of versions
 */
function spawnVersionsWithYarn(packageName, constraint) {
  return new Promise((resolve, reject) => {
    const command = spawn(
      'yarn',
      ['info', packageName, constraint ? 'versions' : 'version', '--json', '--silent'],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'pipe',
        encoding: 'utf-8',
        silent: true,
      }
    );

    command.stdout.on('data', (data) => {
      try {
        const info = JSON.parse(data);
        if (info.type === 'inspect') {
          resolve(info.data);
        }
      } catch (e) {
        reject(new Error(`Unable to find versions of ${packageName} using yarn`));
      }
    });

    command.stderr.on('data', (data) => {
      const info = JSON.parse(data);
      if (info.type === 'error') {
        reject(new Error(info.data));
      }
    });
  });
}

/**
 *  Get latest version(s) of the package available on npmjs.com using Yarn 2 a.k.a Berry
 *
 * @param {string} packageName Name of the package
 * @param {Object} constraint Version range to use to constraint the returned version
 * @returns {Promise<string|Array<string>>} versions  Promise resolved with a version or an array of versions
 */
function spawnVersionsWithYarn2(packageName, constraint) {
  const field = constraint ? 'versions' : 'version';
  return new Promise((resolve, reject) => {
    const command = spawn('yarn', ['npm', 'info', packageName, '--fields', field, '--json'], {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'pipe',
      encoding: 'utf-8',
      silent: true,
    });

    command.stdout.on('data', (data) => {
      try {
        const info = JSON.parse(data);
        resolve(info[field]);
      } catch (e) {
        reject(new Error(`Unable to find versions of ${packageName} using yarn 2`));
      }
    });

    command.stderr.on('data', (data) => {
      const info = JSON.parse(data);
      reject(new Error(info));
    });
  });
}
