import { OutputFile } from 'esbuild';
import { writeFile, ensureFile } from 'fs-extra';
import { join } from 'path';
import { Compilation } from '../types';

export async function readOrderedFiles(
  addonsDir: string,
  outputFiles: Compilation['outputFiles'] | undefined
) {
  const files = await Promise.all(
    outputFiles?.map(async (file) => {
      // convert deeply nested paths to a single level, also remove special characters
      const { location, url } = sanitizePath(file, addonsDir);

      await ensureFile(location).then(() => writeFile(location, file.contents));
      return url;
    }) || []
  );

  const jsFiles = files.filter((file) => file.endsWith('.mjs'));
  const cssFiles = files.filter((file) => file.endsWith('.css'));
  return { cssFiles, jsFiles };
}

export function sanitizePath(file: OutputFile, addonsDir: string) {
  const filePath = file.path.replace(addonsDir, '');
  const location = join(addonsDir, filePath);
  const url = `./sb-addons${filePath.split('/').map(encodeURIComponent).join('/')}`;
  return { location, url };
}
