import { exec } from 'child_process';
import { remove, pathExists, readJSON } from 'fs-extra';
import chalk from 'chalk';
import path from 'path';
import program from 'commander';

import { runServer, parseConfigFile } from 'verdaccio';
import pLimit from 'p-limit';
import type { Server } from 'http';
import { mkdir } from 'fs/promises';
import { PACKS_DIRECTORY } from './utils/constants';

import { maxConcurrentTasks } from './utils/concurrency';
import { getWorkspaces } from './utils/workspace';

program
  .option('-O, --open', 'keep process open')
  .option('-P, --publish', 'should publish packages');

program.parse(process.argv);

const logger = console;

const startVerdaccio = async () => {
  let resolved = false;
  return Promise.race([
    new Promise((resolve) => {
      const cache = path.join(__dirname, '..', '.verdaccio-cache');
      const config = {
        ...parseConfigFile(path.join(__dirname, 'verdaccio.yaml')),
        self_path: cache,
      };

      // @ts-expect-error (verdaccio's interface is wrong)
      runServer(config).then((app: Server) => {
        app.listen(6001, () => {
          resolved = true;
          resolve(app);
        });
      });
    }),
    new Promise((_, rej) => {
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          rej(new Error(`TIMEOUT - verdaccio didn't start within 10s`));
        }
      }, 10000);
    }),
  ]) as Promise<Server>;
};

const currentVersion = async () => {
  const { version } = await readJSON(path.join(__dirname, '..', 'code', 'package.json'));
  return version;
};

const publish = async (packages: { name: string; location: string }[], url: string) => {
  logger.log(`Publishing packages with a concurrency of ${maxConcurrentTasks}`);

  const limit = pLimit(maxConcurrentTasks);
  let i = 0;

  /**
   * We need to "pack" our packages before publishing to npm because our package.json files contain yarn specific version "ranges".
   * such as "workspace:*"
   *
   * We can't publish to npm if the package.json contains these ranges. So with `yarn pack` we create a tarball that we can publish.
   *
   * However this bug exists in NPM: https://github.com/npm/cli/issues/4533!
   * Which causes the NPM CLI to disregard the tarball CLI argument and instead re-create a tarball.
   * But NPM doesn't replace the yarn version ranges.
   *
   * So we create the tarball ourselves and move it to another location on the FS.
   * Then we change-directory to that directory and publish the tarball from there.
   */
  await mkdir(PACKS_DIRECTORY, { recursive: true }).catch(() => {});

  return Promise.all(
    packages.map(({ name, location }) =>
      limit(
        () =>
          new Promise((res, rej) => {
            logger.log(
              `🛫 publishing ${name} (${location.replace(
                path.resolve(path.join(__dirname, '..')),
                '.'
              )})`
            );

            const tarballFilename = `${name.replace('@', '').replace('/', '-')}.tgz`;
            const command = `cd ${path.resolve(
              '../code',
              location
            )} && yarn pack --out=${PACKS_DIRECTORY}/${tarballFilename} && cd ${PACKS_DIRECTORY} && npm publish ./${tarballFilename} --registry ${url} --force --access restricted --ignore-scripts`;
            exec(command, (e) => {
              if (e) {
                rej(e);
              } else {
                i += 1;
                logger.log(`${i}/${packages.length} 🛬 successful publish of ${name}!`);
                res(undefined);
              }
            });
          })
      )
    )
  );
};

const addUser = (url: string) =>
  new Promise<void>((res, rej) => {
    logger.log(`👤 add temp user to verdaccio`);

    exec(`npx npm-cli-adduser -r "${url}" -a -u user -p password -e user@example.com`, (e) => {
      if (e) {
        rej(e);
      } else {
        res();
      }
    });
  });

const run = async () => {
  const verdaccioUrl = `http://localhost:6001`;

  logger.log(`📐 reading version of storybook`);
  logger.log(`🚛 listing storybook packages`);

  if (!process.env.CI) {
    // when running e2e locally, clear cache to avoid EPUBLISHCONFLICT errors
    const verdaccioCache = path.resolve(__dirname, '..', '.verdaccio-cache');
    if (await pathExists(verdaccioCache)) {
      logger.log(`🗑 cleaning up cache`);
      await remove(verdaccioCache);
    }
  }

  logger.log(`🎬 starting verdaccio (this takes ±5 seconds, so be patient)`);

  const [verdaccioServer, packages, version] = await Promise.all([
    startVerdaccio(),
    getWorkspaces(false),
    currentVersion(),
  ]);

  logger.log(`🌿 verdaccio running on ${verdaccioUrl}`);

  // in some environments you need to add a dummy user. always try to add & catch on failure
  try {
    await addUser(verdaccioUrl);
  } catch (e) {
    //
  }

  logger.log(`📦 found ${packages.length} storybook packages at version ${chalk.blue(version)}`);

  if (program.publish) {
    await publish(packages, verdaccioUrl);
  }

  if (!program.open) {
    verdaccioServer.close();
  }
};

run().catch((e) => {
  logger.error(e);
  process.exit(1);
});
