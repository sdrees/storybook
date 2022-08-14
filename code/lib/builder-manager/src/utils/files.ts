import { writeFile, ensureFile } from 'fs-extra';
import { compilation } from '../index';

export async function readOrderedFiles(addonsDir: string) {
  const files = await Promise.all(
    compilation?.outputFiles?.map(async (file) => {
      await ensureFile(file.path).then(() => writeFile(file.path, file.contents));
      return file.path.replace(addonsDir, './sb-addons');
    }) || []
  );

  const jsFiles = files.filter((file) => file.endsWith('.mjs'));
  const cssFiles = files.filter((file) => file.endsWith('.css'));
  return { cssFiles, jsFiles };
}
