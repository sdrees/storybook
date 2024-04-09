import type { Options, SupportedRenderers } from '@storybook/types';
import type { Channel } from '@storybook/channels';
import {
  extractProperRendererNameFromFramework,
  getFrameworkName,
  getProjectRoot,
} from '@storybook/core-common';
import path from 'path';
import fs from 'fs/promises';

import { getParser } from '../utils/parser';
import { searchFiles } from '../utils/search-files';
import { FILE_COMPONENT_SEARCH, FILE_COMPONENT_SEARCH_RESULT } from '@storybook/core-events';

interface Data {
  // A regular string or a glob pattern
  searchQuery?: string;
}

interface SearchResult {
  success: true | false;
  result: null | {
    searchQuery: string;
    files: Array<{
      // The filepath relative to the project root
      filepath: string;
      // The search query - Helps to identify the event on the frontend
      searchQuery: string;
      // A list of exported components
      exportedComponents: Array<{
        // the name of the exported component
        name: string;
        // True, if the exported component is a default export
        default: boolean;
      }>;
    }> | null;
  };
  error: null | string;
}

export function initFileSearchChannel(channel: Channel, options: Options) {
  /**
   * Listens for a search query event and searches for files in the project
   */
  channel.on(FILE_COMPONENT_SEARCH, async (data: Data) => {
    try {
      const searchQuery = data?.searchQuery;

      if (!searchQuery) {
        return;
      }

      const frameworkName = await getFrameworkName(options);

      const rendererName = (await extractProperRendererNameFromFramework(
        frameworkName
      )) as SupportedRenderers;

      const projectRoot = getProjectRoot();

      const files = await searchFiles({
        searchQuery,
        cwd: projectRoot,
      });

      const entries = files.map(async (file) => {
        const parser = getParser(rendererName);

        try {
          const content = await fs.readFile(path.join(projectRoot, file), 'utf-8');
          const info = await parser.parse(content);

          return {
            filepath: file,
            exportedComponents: info.exports,
          };
        } catch (e) {
          return {
            filepath: file,
            exportedComponents: null,
          };
        }
      });

      channel.emit(FILE_COMPONENT_SEARCH_RESULT, {
        success: true,
        result: {
          searchQuery,
          files: await Promise.all(entries),
        },
        error: null,
      } as SearchResult);
    } catch (e: any) {
      /**
       * Emits the search result event with an error message
       */
      channel.emit(FILE_COMPONENT_SEARCH_RESULT, {
        success: false,
        result: null,
        error: `An error occurred while searching for components in the project.\n${e?.message}`,
      } as SearchResult);
    }
  });

  return channel;
}
