#!/usr/bin/env node

const { readJson, writeFile } = require('fs-extra');
const { exec } = require('child_process');
const path = require('path');
const globby = require('globby');
const semver = require('semver');
const { default: dedent } = require('ts-dedent');

const rootDirectory = path.join(__dirname, '..', '..', '..');

const logger = console;

const run = async () => {
  const updatedVersion = process.argv[process.argv.length - 1];

  if (!semver.valid(updatedVersion)) throw new Error(`Invalid version: ${updatedVersion}`);

  logger.log(`Generating versions.ts with v${updatedVersion}`);

  const storybookPackagesPaths = await globby(
    `${rootDirectory}/@(frameworks|addons|lib|renderers|presets)/**/package.json`,
    {
      ignore: '**/node_modules/**/*',
    }
  );

  const packageToVersionMap = (
    await Promise.all(
      storybookPackagesPaths.map(async (storybookPackagePath) => {
        const { name, version } = await readJson(storybookPackagePath);

        return {
          name,
          version,
        };
      })
    )
  )
    .filter(({ name }) => /^(@storybook|sb$|storybook$)/.test(name))
    // As some previous steps are asynchronous order is not always the same so sort them to avoid that
    .sort((package1, package2) => package1.name.localeCompare(package2.name))
    .reduce((acc, { name }) => ({ ...acc, [name]: updatedVersion }), {});

  const versionsPath = path.join(__dirname, '..', 'src', 'versions.ts');

  await writeFile(
    versionsPath,
    dedent`
      // auto generated file, do not edit
      export default ${JSON.stringify(packageToVersionMap, null, 2)}
    `
  );

  logger.log(`Updating versions and formatting results at: ${versionsPath}`);

  exec(`yarn lint:js:cmd --fix ${versionsPath}`, {
    cwd: path.join(__dirname, '..', '..', '..'),
  });
};

run().catch((e) => {
  logger.error(e);
  process.exit(1);
});
