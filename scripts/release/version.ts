/* eslint-disable no-console */
import { setOutput } from '@actions/core';
import { readFile, readJson, writeFile, writeJson } from 'fs-extra';
import chalk from 'chalk';
import path from 'path';
import program from 'commander';
import semver from 'semver';
import { z } from 'zod';
import type { Workspace } from '../utils/workspace';
import { getWorkspaces } from '../utils/workspace';
import { execaCommand } from '../utils/exec';

program
  .name('version')
  .description('version all packages')
  .option(
    '-R, --release-type <major|minor|patch|prerelease>',
    'Which release type to use to bump the version'
  )
  .option('-P, --pre-id <id>', 'Which prerelease identifer to change to, eg. "alpha", "beta", "rc"')
  .option(
    '-E, --exact <version>',
    'Use exact version instead of calculating from current version, eg. "7.2.0-canary.123". Can not be combined with --release-type or --pre-id'
  )
  .option('-V, --verbose', 'Enable verbose logging', false);

const optionsSchema = z
  .object({
    releaseType: z
      .enum(['major', 'minor', 'patch', 'prerelease', 'premajor', 'preminor', 'prepatch'])
      .optional(),
    preId: z.string().optional(),
    exact: z
      .string()
      .optional()
      .refine((version) => (version ? semver.valid(version) !== null : true), {
        message: '--exact version has to be a valid semver string',
      }),
    verbose: z.boolean().optional(),
  })
  .superRefine((schema, ctx) => {
    // manual union validation because zod + commander is not great in this case
    const hasExact = 'exact' in schema && schema.exact;
    const hasReleaseType = 'releaseType' in schema && schema.releaseType;
    if ((hasExact && hasReleaseType) || (!hasExact && !hasReleaseType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Combining --exact with --release-type is invalid, but having one of them is required',
      });
    }
    if (schema.preId && !schema.releaseType.startsWith('pre')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Using prerelease identifier requires one of release types: premajor, preminor, prepatch, prerelease',
      });
    }
    return z.NEVER;
  });

type BaseOptions = { verbose: boolean };
type BumpOptions = BaseOptions & {
  releaseType: semver.ReleaseType;
  preId?: string;
};
type ExactOptions = BaseOptions & {
  exact: semver.ReleaseType;
};
type Options = BumpOptions | ExactOptions;

const CODE_DIR_PATH = path.join(__dirname, '..', '..', 'code');
const CODE_PACKAGE_JSON_PATH = path.join(CODE_DIR_PATH, 'package.json');

const validateOptions = (options: { [key: string]: any }): options is Options => {
  optionsSchema.parse(options);
  return true;
};

const getCurrentVersion = async () => {
  console.log(`📐 Reading current version of Storybook...`);
  const { version } = await readJson(CODE_PACKAGE_JSON_PATH);
  return version;
};

const bumpCodeVersion = async (nextVersion: string) => {
  console.log(`🤜 Bumping version of ${chalk.cyan('code')}'s package.json...`);

  const codePkgJson = await readJson(CODE_PACKAGE_JSON_PATH);

  codePkgJson.version = nextVersion;
  await writeJson(CODE_PACKAGE_JSON_PATH, codePkgJson, { spaces: 2 });

  console.log(`✅ Bumped version of ${chalk.cyan('code')}'s package.json`);
};

const bumpAllPackageVersions = async (nextVersion: string, verbose?: boolean) => {
  console.log(`🤜 Bumping version of ${chalk.cyan('all packages')}...`);

  console.log(`✅ Bumped version of ${chalk.cyan('all packages')}`);
};

const bumpVersionSources = async (currentVersion: string, nextVersion: string) => {
  const filesToUpdate = [
    path.join(CODE_DIR_PATH, 'lib', 'manager-api', 'src', 'version.ts'),
    path.join(CODE_DIR_PATH, 'lib', 'cli', 'src', 'versions.ts'),
  ];
  console.log(`🤜 Bumping versions in...:\n  ${chalk.cyan(filesToUpdate.join('\n  '))}`);

  await Promise.all(
    filesToUpdate.map(async (filename) => {
      const currentContent = await readFile(filename, { encoding: 'utf-8' });
      const nextContent = currentContent.replaceAll(currentVersion, nextVersion);
      return writeFile(filename, nextContent);
    })
  );

  console.log(`✅ Bumped versions in:\n  ${chalk.cyan(filesToUpdate.join('\n  '))}`);
};

const bumpAllPackageJsons = async ({
  packages,
  currentVersion,
  nextVersion,
  verbose,
}: {
  packages: Workspace[];
  currentVersion: string;
  nextVersion: string;
  verbose?: boolean;
}) => {
  console.log(
    `🤜 Bumping versions and dependencies in ${chalk.cyan(
      `all ${packages.length} package.json`
    )}'s...`
  );
  // 1. go through all packages in the monorepo
  await Promise.all(
    packages.map(async (pkg) => {
      // 2. get the package.json
      const packageJsonPath = path.join(CODE_DIR_PATH, pkg.location, 'package.json');
      const packageJson: {
        version: string;
        dependencies: Record<string, string>;
        devDependencies: Record<string, string>;
        peerDependencies: Record<string, string>;
        [key: string]: any;
      } = await readJson(packageJsonPath);
      // 3. bump the version
      packageJson.version = nextVersion;
      const { dependencies, devDependencies, peerDependencies } = packageJson;
      if (verbose) {
        console.log(
          `    Bumping ${chalk.blue(pkg.name)}'s version to ${chalk.yellow(nextVersion)}`
        );
      }
      // 4. go through all deps in the package.json
      Object.entries({ dependencies, devDependencies, peerDependencies }).forEach(
        ([depType, deps]) => {
          if (!deps) {
            return;
          }
          // 5. find all storybook deps
          Object.entries(deps)
            .filter(
              ([depName, depVersion]) =>
                depName.startsWith('@storybook/') &&
                // ignore storybook dependneices that don't use the current version
                depVersion.includes(currentVersion)
            )
            .forEach(([depName, depVersion]) => {
              // 6. bump the version of any found storybook dep
              const nextDepVersion = depVersion.replace(currentVersion, nextVersion);
              if (verbose) {
                console.log(
                  `    Bumping ${chalk.blue(pkg.name)}'s ${chalk.red(depType)} on ${chalk.green(
                    depName
                  )} from ${chalk.yellow(depVersion)} to ${chalk.yellow(nextDepVersion)}`
                );
              }
              packageJson[depType][depName] = nextDepVersion;
            });
        }
      );
      await writeJson(packageJsonPath, packageJson, { spaces: 2 });
    })
  );
  console.log(`✅ Bumped peer dependency versions in ${chalk.cyan('all packages')}`);
};

export const run = async (options: unknown) => {
  if (!validateOptions(options)) {
    return;
  }
  const { verbose } = options;

  console.log(`🚛 Finding Storybook packages...`);

  const [packages, currentVersion] = await Promise.all([getWorkspaces(), getCurrentVersion()]);

  console.log(
    `📦 found ${packages.length} storybook packages at version ${chalk.red(currentVersion)}`
  );
  if (verbose) {
    const formattedPackages = packages.map(
      (pkg) => `${chalk.green(pkg.name.padEnd(60))}: ${chalk.cyan(pkg.location)}`
    );
    console.log(`📦 Packages:
        ${formattedPackages.join('\n    ')}`);
  }

  let nextVersion: string;

  if ('exact' in options && options.exact) {
    console.log(`📈 Exact version selected: ${chalk.green(options.exact)}`);
    nextVersion = options.exact;
  } else {
    const { releaseType, preId } = options as BumpOptions;
    console.log(`📈 Release type selected: ${chalk.green(releaseType)}`);
    if (preId) {
      console.log(`🆔 Version prerelease identifier selected: ${chalk.yellow(preId)}`);
    }

    nextVersion = semver.inc(currentVersion, releaseType, preId);

    console.log(
      `⏭ Bumping version ${chalk.blue(currentVersion)} with release type ${chalk.green(
        releaseType
      )}${
        preId ? ` and ${chalk.yellow(preId)}` : ''
      } results in version: ${chalk.bgGreenBright.bold(nextVersion)}`
    );
  }

  console.log(`⏭ Bumping all packages to ${chalk.blue(nextVersion)}...`);

  await bumpCodeVersion(nextVersion);
  await bumpVersionSources(currentVersion, nextVersion);
  await bumpAllPackageJsons({ packages, currentVersion, nextVersion, verbose });

  console.log(`⬆️ Updating lock file with ${chalk.blue('yarn install --mode=update-lockfile')}`);
  await execaCommand(`yarn install --mode=update-lockfile`, {
    cwd: path.join(CODE_DIR_PATH),
    stdio: verbose ? 'inherit' : undefined,
  });
  console.log(`✅ Updated lock file with ${chalk.blue('yarn install --mode=update-lockfile')}`);

  if (process.env.GITHUB_ACTIONS === 'true') {
    setOutput('current-version', currentVersion);
    setOutput('next-version', nextVersion);
  }
};

if (require.main === module) {
  const options = program.parse().opts();
  run(options).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
