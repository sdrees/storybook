import path from 'path';
import { pathExists } from 'fs-extra';
import { CODE_DIRECTORY } from './constants';

// packageDirs of the form `lib/store`
// paths to check of the form 'template/stories'
export const filterExistsInCodeDir = async (packageDirs: string[], pathToCheck: string) =>
  (
    await Promise.all(
      packageDirs.map(async (p) =>
        (await pathExists(path.resolve(CODE_DIRECTORY, path.join(p, pathToCheck)))) ? p : null
      )
    )
  ).filter(Boolean);
