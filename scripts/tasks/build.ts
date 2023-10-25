import { pathExists } from 'fs-extra';
import dirSize from 'fast-folder-size';
import { promisify } from 'util';
import { join } from 'path';
import type { Task } from '../task';
import { exec } from '../utils/exec';
import { now, saveBench } from '../bench/utils';

export const build: Task = {
  description: 'Build the static version of the sandbox',
  dependsOn: ['sandbox'],
  async ready({ builtSandboxDir }) {
    return pathExists(builtSandboxDir);
  },
  async run({ sandboxDir }, { dryRun, debug }) {
    const start = now();

    await exec(`yarn build-storybook --quiet`, { cwd: sandboxDir }, { dryRun, debug });

    const buildTime = now() - start;
    const dir = join(sandboxDir, 'storybook-static');
    const getSize = promisify(dirSize);
    const buildSize = await getSize(dir);
    const buildSbAddonsSize = await getSize(join(dir, 'sb-addons'));
    const buildSbCommonSize = await getSize(join(dir, 'sb-common-assets'));
    const buildSbManagerSize = await getSize(join(dir, 'sb-manager'));
    const buildSbPreviewSize = await getSize(join(dir, 'sb-preview'));
    const buildPrebuildSize =
      buildSbAddonsSize + buildSbCommonSize + buildSbManagerSize + buildSbPreviewSize;

    const buildStaticSize = await getSize(join(dir, 'static')).catch(() => 0);
    const buildPreviewSize = buildSize - buildPrebuildSize - buildStaticSize;

    await saveBench(
      'build',
      {
        buildTime,
        buildSize,
        buildSbAddonsSize,
        buildSbCommonSize,
        buildSbManagerSize,
        buildSbPreviewSize,
        buildStaticSize,
        buildPrebuildSize,
        buildPreviewSize,
      },
      { rootDir: sandboxDir }
    );
  },
};

export const testBuild: Task = {
  description: 'Build the static version of the sandbox optimized for testing purposes',
  dependsOn: ['sandbox'],
  async ready({ builtSandboxDir }) {
    return pathExists(builtSandboxDir);
  },
  async run({ sandboxDir }, { dryRun, debug }) {
    const start = now();

    await exec(`yarn build-storybook --test --quiet`, { cwd: sandboxDir }, { dryRun, debug });

    const testBuildTime = now() - start;
    const dir = join(sandboxDir, 'storybook-static');
    const getSize = promisify(dirSize);
    const testBuildSize = await getSize(dir);
    const testBuildSbAddonsSize = await getSize(join(dir, 'sb-addons'));
    const testBuildSbCommonSize = await getSize(join(dir, 'sb-common-assets'));
    const testBuildSbManagerSize = await getSize(join(dir, 'sb-manager'));
    const testBuildSbPreviewSize = await getSize(join(dir, 'sb-preview'));
    const testBuildPrebuildSize =
      testBuildSbAddonsSize +
      testBuildSbCommonSize +
      testBuildSbManagerSize +
      testBuildSbPreviewSize;

    const testBuildStaticSize = await getSize(join(dir, 'static')).catch(() => 0);
    const testBuildPreviewSize = testBuildSize - testBuildPrebuildSize - testBuildStaticSize;

    await saveBench(
      'test-build',
      {
        testBuildTime,
        testBuildSize,
        testBuildSbAddonsSize,
        testBuildSbCommonSize,
        testBuildSbManagerSize,
        testBuildSbPreviewSize,
        testBuildStaticSize,
        testBuildPrebuildSize,
        testBuildPreviewSize,
      },
      { rootDir: sandboxDir }
    );
  },
};
