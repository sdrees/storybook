import type { PreviewAnnotation } from '@storybook/types';
import { resolve } from 'path';

/**
 * Preview annotations can take several forms, and vite needs them to be
 * a bit more restrained.
 *
 * For node_modules, we want bare imports (so vite can process them),
 * and for files in the user's source,
 * we want absolute paths.
 */
export function processPreviewAnnotation(path: PreviewAnnotation | undefined) {
  // If entry is an object, take the first, which is the
  // bare (non-absolute) specifier.
  // This is so that webpack can use an absolute path, and
  // continue supporting super-addons in pnp/pnpm without
  // requiring them to re-export their sub-addons as we do
  // in addon-essentials.
  if (typeof path === 'object') {
    return path.bare;
  }
  // resolve relative paths into absolute paths, but don't resolve "bare" imports
  if (path?.startsWith('./') || path?.startsWith('../')) {
    return resolve(path);
  }
  // This should not occur, since we use `.filter(Boolean)` prior to
  // calling this function, but this makes typescript happy
  if (!path) {
    throw new Error('Could not determine path for previewAnnotation');
  }

  return path;
}
