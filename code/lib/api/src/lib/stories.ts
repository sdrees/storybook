import memoize from 'memoizerific';
import { dedent } from 'ts-dedent';
import countBy from 'lodash/countBy';
import { sanitize } from '@storybook/csf';
import type {
  StoryId,
  Parameters,
  DocsOptions,
  API_Provider,
  API_SetStoriesStoryData,
  API_PreparedStoryIndex,
  API_StoryIndexV3,
  API_IndexEntry,
  API_RootEntry,
  API_GroupEntry,
  API_ComponentEntry,
  API_StoriesHash,
  API_DocsEntry,
  API_StoryEntry,
  API_HashEntry,
  API_SetStoriesPayload,
} from '@storybook/types';

import mapValues from 'lodash/mapValues';
// eslint-disable-next-line import/no-cycle
import { type API, combineParameters } from '../index';
import merge from './merge';

const TITLE_PATH_SEPARATOR = /\s*\/\s*/;

export const denormalizeStoryParameters = ({
  globalParameters,
  kindParameters,
  stories,
}: API_SetStoriesPayload): API_SetStoriesStoryData => {
  return mapValues(stories, (storyData) => ({
    ...storyData,
    parameters: combineParameters(
      globalParameters,
      kindParameters[storyData.kind],
      storyData.parameters as unknown as Parameters
    ),
  }));
};

export const transformSetStoriesStoryDataToStoriesHash = (
  data: API_SetStoriesStoryData,
  { provider, docsOptions }: { provider: API_Provider<API>; docsOptions: DocsOptions }
) =>
  transformStoryIndexToStoriesHash(transformSetStoriesStoryDataToPreparedStoryIndex(data), {
    provider,
    docsOptions,
  });

const transformSetStoriesStoryDataToPreparedStoryIndex = (
  stories: API_SetStoriesStoryData
): API_PreparedStoryIndex => {
  const entries: API_PreparedStoryIndex['entries'] = Object.entries(stories).reduce(
    (acc, [id, story]) => {
      if (!story) return acc;

      const { docsOnly, fileName, ...parameters } = story.parameters;
      const base = {
        title: story.kind,
        id,
        name: story.name,
        importPath: fileName,
      };
      if (docsOnly) {
        acc[id] = {
          type: 'docs',
          storiesImports: [],
          ...base,
        };
      } else {
        const { argTypes, args, initialArgs } = story;
        acc[id] = {
          type: 'story',
          ...base,
          parameters,
          argTypes,
          args,
          initialArgs,
        };
      }
      return acc;
    },
    {} as API_PreparedStoryIndex['entries']
  );

  return { v: 4, entries };
};

const transformStoryIndexV3toV4 = (index: API_StoryIndexV3): API_PreparedStoryIndex => {
  const countByTitle = countBy(Object.values(index.stories), 'title');
  return {
    v: 4,
    entries: Object.values(index.stories).reduce((acc, entry) => {
      let type: API_IndexEntry['type'] = 'story';
      if (
        entry.parameters?.docsOnly ||
        (entry.name === 'Page' && countByTitle[entry.title] === 1)
      ) {
        type = 'docs';
      }
      acc[entry.id] = {
        type,
        ...(type === 'docs' && { storiesImports: [] }),
        ...entry,
      };
      return acc;
    }, {} as API_PreparedStoryIndex['entries']),
  };
};

export const transformStoryIndexToStoriesHash = (
  index: API_PreparedStoryIndex,
  {
    provider,
    docsOptions,
  }: {
    provider: API_Provider<API>;
    docsOptions: DocsOptions;
  }
): API_StoriesHash => {
  if (!index.v) throw new Error('Composition: Missing stories.json version');

  const v4Index = index.v === 4 ? index : transformStoryIndexV3toV4(index as any);

  const entryValues = Object.values(v4Index.entries);
  const { sidebar = {} } = provider.getConfig();
  const { showRoots, collapsedRoots = [], renderLabel } = sidebar;

  const setShowRoots = typeof showRoots !== 'undefined';

  const storiesHashOutOfOrder = Object.values(entryValues).reduce((acc, item) => {
    if (docsOptions.docsMode && item.type !== 'docs') return acc;

    // First, split the title into a set of names, separated by '/' and trimmed.
    const { title } = item;
    const groups = title.trim().split(TITLE_PATH_SEPARATOR);
    const root = (!setShowRoots || showRoots) && groups.length > 1 ? [groups.shift()] : [];
    const names = [...root, ...groups];

    // Now create a "path" or sub id for each name
    const paths = names.reduce((list, name, idx) => {
      const parent = idx > 0 && list[idx - 1];
      const id = sanitize(parent ? `${parent}-${name}` : name);

      if (parent === id) {
        throw new Error(
          dedent`
          Invalid part '${name}', leading to id === parentId ('${id}'), inside title '${title}'
          
          Did you create a path that uses the separator char accidentally, such as 'Vue <docs/>' where '/' is a separator char? See https://github.com/storybookjs/storybook/issues/6128
          `
        );
      }
      list.push(id);
      return list;
    }, [] as string[]);

    // Now, let's add an entry to the hash for each path/name pair
    paths.forEach((id, idx) => {
      // The child is the next path, OR the story/docs entry itself
      const childId = paths[idx + 1] || item.id;

      if (root.length && idx === 0) {
        acc[id] = merge<API_RootEntry>((acc[id] || {}) as API_RootEntry, {
          type: 'root',
          id,
          name: names[idx],
          depth: idx,
          renderLabel,
          startCollapsed: collapsedRoots.includes(id),
          // Note that this will later get appended to the previous list of children (see below)
          children: [childId],

          // deprecated fields
          isRoot: true,
          isComponent: false,
          isLeaf: false,
        });
        // Usually the last path/name pair will be displayed as a component,
        // *unless* there are other stories that are more deeply nested under it
        //
        // For example, if we had stories for both
        //   - Atoms / Button
        //   - Atoms / Button / LabelledButton
        //
        // In this example the entry for 'atoms-button' would *not* be a component.
      } else if ((!acc[id] || acc[id].type === 'component') && idx === paths.length - 1) {
        acc[id] = merge<API_ComponentEntry>((acc[id] || {}) as API_ComponentEntry, {
          type: 'component',
          id,
          name: names[idx],
          parent: paths[idx - 1],
          depth: idx,
          renderLabel,
          ...(childId && {
            children: [childId],
          }),
          // deprecated fields
          isRoot: false,
          isComponent: true,
          isLeaf: false,
        });
      } else {
        acc[id] = merge<API_GroupEntry>((acc[id] || {}) as API_GroupEntry, {
          type: 'group',
          id,
          name: names[idx],
          parent: paths[idx - 1],
          depth: idx,
          renderLabel,
          ...(childId && {
            children: [childId],
          }),
          // deprecated fields
          isRoot: false,
          isComponent: false,
          isLeaf: false,
        });
      }
    });

    // Finally add an entry for the docs/story itself
    acc[item.id] = {
      type: 'story',
      ...item,
      depth: paths.length,
      parent: paths[paths.length - 1],
      renderLabel,
      ...(item.type !== 'docs' && { prepared: !!item.parameters }),

      // deprecated fields
      kind: item.title,
      isRoot: false,
      isComponent: false,
      isLeaf: true,
    } as API_DocsEntry | API_StoryEntry;

    return acc;
  }, {} as API_StoriesHash);

  // This function adds a "root" or "orphan" and all of its descendents to the hash.
  function addItem(acc: API_StoriesHash, item: API_HashEntry) {
    // If we were already inserted as part of a group, that's great.
    if (acc[item.id]) {
      return acc;
    }

    acc[item.id] = item;
    // Ensure we add the children depth-first *before* inserting any other entries
    if (item.type === 'root' || item.type === 'group' || item.type === 'component') {
      item.children.forEach((childId) => addItem(acc, storiesHashOutOfOrder[childId]));
    }
    return acc;
  }

  // We'll do two passes over the data, adding all the orphans, then all the roots
  const orphanHash = Object.values(storiesHashOutOfOrder)
    .filter((i) => i.type !== 'root' && !i.parent)
    .reduce(addItem, {});

  return Object.values(storiesHashOutOfOrder)
    .filter((i) => i.type === 'root')
    .reduce(addItem, orphanHash);
};

export const addPreparedStories = (newHash: API_StoriesHash, oldHash?: API_StoriesHash) => {
  if (!oldHash) return newHash;

  return Object.fromEntries(
    Object.entries(newHash).map(([id, newEntry]) => {
      const oldEntry = oldHash[id];
      if (newEntry.type === 'story' && oldEntry?.type === 'story' && oldEntry.prepared) {
        return [id, { ...oldEntry, ...newEntry, prepared: true }];
      }

      return [id, newEntry];
    })
  );
};

export const getComponentLookupList = memoize(1)((hash: API_StoriesHash) => {
  return Object.entries(hash).reduce((acc, i) => {
    const value = i[1];
    if (value.type === 'component') {
      acc.push([...value.children]);
    }
    return acc;
  }, [] as StoryId[][]);
});

export const getStoriesLookupList = memoize(1)((hash: API_StoriesHash) => {
  return Object.keys(hash).filter((k) => ['story', 'docs'].includes(hash[k].type));
});
