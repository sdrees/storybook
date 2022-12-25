import { join, parse, relative } from 'path';
import fs from 'fs-extra';
import findCacheDirectory from 'find-cache-dir';
/**
 * Manager entries should be **self-invoking** bits of code.
 * They can of-course import from modules, and ESbuild will bundle all of that into a single file.
 * But they should not export anything. However this can't be enforced, so what we do is wrap the given file, in a bit of code like this:
 *
 * ```js
 * import '<<file>>';
 * ```
 *
 * That way we are indicating to ESbuild that we do not care about this files exports, and they will be dropped in the bundle.
 *
 * We do all of that so we can wrap a try-catch around the code.
 * That would have been invalid syntax had the export statements been left in place.
 *
 * We need to wrap each managerEntry with a try-catch because if we do not, a failing managerEntry can stop execution of other managerEntries.
 */
export async function wrapManagerEntries(entrypoints: string[]) {
  return Promise.all(
    entrypoints.map(async (entry) => {
      const { name, dir } = parse(entry);
      const cacheLocation = findCacheDirectory({ name: 'sb-manager' });

      if (!cacheLocation) {
        throw new Error('Could not create/find cache directory');
      }

      const location = join(cacheLocation, relative(process.cwd(), dir), `${name}-bundle.mjs`);
      await fs.ensureFile(location);
      await fs.writeFile(location, `import '${entry}';`);

      return location;
    })
  );
}
