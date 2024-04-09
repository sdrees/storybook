export type SearchResult = Array<string>;

/**
 * File extensions that should be searched for
 */
const fileExtensions = ['js', 'mjs', 'cjs', 'jsx', 'mts', 'ts', 'tsx', 'cts'];

/**
 * Search for files in a directory that match the search query
 * @param searchQuery The search query. This can be a glob pattern
 * @param cwd The directory to search in
 * @param renderer The renderer to use for parsing the files
 * @returns A list of files that match the search query
 */
export async function searchFiles({
  searchQuery,
  cwd,
}: {
  searchQuery: string;
  cwd: string;
}): Promise<SearchResult> {
  // Dynamically import globby because it is a pure ESM module
  const { globby, isDynamicPattern } = await import('globby');

  const hasSearchSpecialGlobChars = isDynamicPattern(searchQuery, { cwd });

  const hasFileExtensionRegex = /(\.[a-z]+)$/i;
  const searchQueryHasExtension = hasFileExtensionRegex.test(searchQuery);
  const fileExtensionsPattern = `{${fileExtensions.join(',')}}`;

  const globbedSearchQuery = hasSearchSpecialGlobChars
    ? searchQuery
    : searchQueryHasExtension
      ? [`**/*${searchQuery}*`, `**/*${searchQuery}*/**`]
      : [
          `**/*${searchQuery}*.${fileExtensionsPattern}`,
          `**/*${searchQuery}*/**/*.${fileExtensionsPattern}`,
        ];

  const entries = await globby(globbedSearchQuery, {
    ignore: ['**/node_modules/**', '**/*.spec.*', '**/*.test.*'],
    gitignore: true,
    cwd,
    objectMode: true,
  });

  return entries.map((entry) => entry.path);
}
