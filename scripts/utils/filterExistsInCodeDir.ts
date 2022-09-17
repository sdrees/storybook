import path from 'path';
import { pathExists } from 'fs-extra';

export const codeDir = path.resolve(__dirname, '../../code');

// packageDirs of the form `lib/store`
// paths to check of the form 'template/stories'
export const filterExistsInCodeDir = async (packageDirs: string[], pathToCheck: string) =>
  (
    await Promise.all(
      packageDirs.map(async (p) =>
        (await pathExists(path.resolve(codeDir, path.join(p, pathToCheck)))) ? p : null
      )
    )
  ).filter(Boolean);
