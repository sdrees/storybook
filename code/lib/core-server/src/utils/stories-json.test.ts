/// <reference types="@types/jest" />;

import type { Router, Request, Response } from 'express';
import Watchpack from 'watchpack';
import path from 'path';
import debounce from 'lodash/debounce.js';
// @ts-expect-error -- cannot find declaration file
import { createStoriesMdxIndexer } from '@storybook/addon-docs/preset';
import { STORY_INDEX_INVALIDATED } from '@storybook/core-events';
import { normalizeStoriesEntry } from '@storybook/core-common';

import { useStoriesJson, DEBOUNCE } from './stories-json';
import type { ServerChannel } from './get-server-channel';
import type { StoryIndexGeneratorOptions } from './StoryIndexGenerator';
import { StoryIndexGenerator } from './StoryIndexGenerator';
import { csfIndexer } from '../presets/common-preset';

jest.mock('watchpack');
jest.mock('lodash/debounce');
jest.mock('@storybook/node-logger');

const workingDir = path.join(__dirname, '__mockdata__');
const normalizedStories = [
  normalizeStoriesEntry(
    {
      titlePrefix: '',
      directory: './src',
      files: '**/*.stories.@(ts|js|mjs|jsx)',
    },
    { workingDir, configDir: workingDir }
  ),
  normalizeStoriesEntry(
    {
      titlePrefix: '',
      directory: './src',
      files: '**/*.mdx',
    },
    { workingDir, configDir: workingDir }
  ),
];

const getInitializedStoryIndexGenerator = async (
  overrides: any = {},
  inputNormalizedStories = normalizedStories
) => {
  const options: StoryIndexGeneratorOptions = {
    storyIndexers: [],
    indexers: [csfIndexer, createStoriesMdxIndexer(false)],
    configDir: workingDir,
    workingDir,
    storyStoreV7: true,
    docs: { defaultName: 'docs', autodocs: false },
    ...overrides,
  };
  const generator = new StoryIndexGenerator(inputNormalizedStories, options);
  await generator.initialize();
  return generator;
};

describe('useStoriesJson', () => {
  const use = jest.fn();
  const router: Router = { use } as any;
  const send = jest.fn();
  const write = jest.fn();
  const response: Response = {
    header: jest.fn(),
    send,
    status: jest.fn(),
    setHeader: jest.fn(),
    flushHeaders: jest.fn(),
    write,
    flush: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  } as any;

  beforeEach(async () => {
    use.mockClear();
    send.mockClear();
    write.mockClear();
    (debounce as jest.Mock).mockImplementation((cb) => cb);
  });

  const request: Request = {
    headers: { accept: 'application/json' },
  } as any;

  describe('JSON endpoint', () => {
    it('scans and extracts index', async () => {
      const mockServerChannel = { emit: jest.fn() } as any as ServerChannel;
      useStoriesJson({
        router,
        serverChannel: mockServerChannel,
        workingDir,
        normalizedStories,
        initializedStoryIndexGenerator: getInitializedStoryIndexGenerator(),
      });

      expect(use).toHaveBeenCalledTimes(1);
      const route = use.mock.calls[0][1];

      await route(request, response);

      expect(send).toHaveBeenCalledTimes(1);
      expect(JSON.parse(send.mock.calls[0][0])).toMatchInlineSnapshot(`
        Object {
          "entries": Object {
            "a--metaof": Object {
              "id": "a--metaof",
              "importPath": "./src/docs2/MetaOf.mdx",
              "name": "MetaOf",
              "storiesImports": Array [
                "./src/A.stories.js",
              ],
              "tags": Array [
                "attached-mdx",
                "docs",
              ],
              "title": "A",
              "type": "docs",
            },
            "a--second-docs": Object {
              "id": "a--second-docs",
              "importPath": "./src/docs2/SecondMetaOf.mdx",
              "name": "Second Docs",
              "storiesImports": Array [
                "./src/A.stories.js",
              ],
              "tags": Array [
                "attached-mdx",
                "docs",
              ],
              "title": "A",
              "type": "docs",
            },
            "a--story-one": Object {
              "id": "a--story-one",
              "importPath": "./src/A.stories.js",
              "name": "Story One",
              "tags": Array [
                "component-tag",
                "story-tag",
                "story",
              ],
              "title": "A",
              "type": "story",
            },
            "b--story-one": Object {
              "id": "b--story-one",
              "importPath": "./src/B.stories.ts",
              "name": "Story One",
              "tags": Array [
                "autodocs",
                "story",
              ],
              "title": "B",
              "type": "story",
            },
            "d--story-one": Object {
              "id": "d--story-one",
              "importPath": "./src/D.stories.jsx",
              "name": "Story One",
              "tags": Array [
                "autodocs",
                "story",
              ],
              "title": "D",
              "type": "story",
            },
            "docs2-componentreference--docs": Object {
              "id": "docs2-componentreference--docs",
              "importPath": "./src/docs2/ComponentReference.mdx",
              "name": "docs",
              "storiesImports": Array [],
              "tags": Array [
                "unattached-mdx",
                "docs",
              ],
              "title": "docs2/ComponentReference",
              "type": "docs",
            },
            "docs2-notitle--docs": Object {
              "id": "docs2-notitle--docs",
              "importPath": "./src/docs2/NoTitle.mdx",
              "name": "docs",
              "storiesImports": Array [],
              "tags": Array [
                "unattached-mdx",
                "docs",
              ],
              "title": "docs2/NoTitle",
              "type": "docs",
            },
            "docs2-yabbadabbadooo--docs": Object {
              "id": "docs2-yabbadabbadooo--docs",
              "importPath": "./src/docs2/Title.mdx",
              "name": "docs",
              "storiesImports": Array [],
              "tags": Array [
                "unattached-mdx",
                "docs",
              ],
              "title": "docs2/Yabbadabbadooo",
              "type": "docs",
            },
            "first-nested-deeply-f--story-one": Object {
              "id": "first-nested-deeply-f--story-one",
              "importPath": "./src/first-nested/deeply/F.stories.js",
              "name": "Story One",
              "tags": Array [
                "story",
              ],
              "title": "first-nested/deeply/F",
              "type": "story",
            },
            "h--story-one": Object {
              "id": "h--story-one",
              "importPath": "./src/H.stories.mjs",
              "name": "Story One",
              "tags": Array [
                "autodocs",
                "story",
              ],
              "title": "H",
              "type": "story",
            },
            "nested-button--story-one": Object {
              "id": "nested-button--story-one",
              "importPath": "./src/nested/Button.stories.ts",
              "name": "Story One",
              "tags": Array [
                "component-tag",
                "story",
              ],
              "title": "nested/Button",
              "type": "story",
            },
            "nested-page--docs": Object {
              "id": "nested-page--docs",
              "importPath": "./src/nested/Page.stories.mdx",
              "name": "docs",
              "storiesImports": Array [],
              "tags": Array [
                "stories-mdx",
                "docs",
              ],
              "title": "nested/Page",
              "type": "docs",
            },
            "nested-page--story-one": Object {
              "id": "nested-page--story-one",
              "importPath": "./src/nested/Page.stories.mdx",
              "name": "StoryOne",
              "tags": Array [
                "stories-mdx",
                "story",
              ],
              "title": "nested/Page",
              "type": "story",
            },
            "second-nested-g--story-one": Object {
              "id": "second-nested-g--story-one",
              "importPath": "./src/second-nested/G.stories.ts",
              "name": "Story One",
              "tags": Array [
                "story",
              ],
              "title": "second-nested/G",
              "type": "story",
            },
          },
          "v": 4,
        }
      `);
    });

    it('disallows .mdx files without storyStoreV7', async () => {
      const mockServerChannel = { emit: jest.fn() } as any as ServerChannel;
      useStoriesJson({
        router,
        initializedStoryIndexGenerator: getInitializedStoryIndexGenerator({
          storyStoreV7: false,
        }),
        workingDir,
        serverChannel: mockServerChannel,
        normalizedStories,
      });

      expect(use).toHaveBeenCalledTimes(1);
      const route = use.mock.calls[0][1];

      await route(request, response);

      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0]).toMatchInlineSnapshot(`
        "Unable to index files:
        - ./src/docs2/ComponentReference.mdx: Invariant failed: You cannot use \`.mdx\` files without using \`storyStoreV7\`.
        - ./src/docs2/MetaOf.mdx: Invariant failed: You cannot use \`.mdx\` files without using \`storyStoreV7\`.
        - ./src/docs2/NoTitle.mdx: Invariant failed: You cannot use \`.mdx\` files without using \`storyStoreV7\`.
        - ./src/docs2/SecondMetaOf.mdx: Invariant failed: You cannot use \`.mdx\` files without using \`storyStoreV7\`.
        - ./src/docs2/Template.mdx: Invariant failed: You cannot use \`.mdx\` files without using \`storyStoreV7\`.
        - ./src/docs2/Title.mdx: Invariant failed: You cannot use \`.mdx\` files without using \`storyStoreV7\`."
      `);
    });

    it('can handle simultaneous access', async () => {
      const mockServerChannel = { emit: jest.fn() } as any as ServerChannel;

      useStoriesJson({
        router,
        serverChannel: mockServerChannel,
        workingDir,
        normalizedStories,
        initializedStoryIndexGenerator: getInitializedStoryIndexGenerator(),
      });

      expect(use).toHaveBeenCalledTimes(1);
      const route = use.mock.calls[0][1];

      const firstPromise = route(request, response);
      const secondResponse = { ...response, send: jest.fn(), status: jest.fn() };
      const secondPromise = route(request, secondResponse);

      await Promise.all([firstPromise, secondPromise]);

      expect(send).toHaveBeenCalledTimes(1);
      expect(response.status).not.toEqual(500);
      expect(secondResponse.send).toHaveBeenCalledTimes(1);
      expect(secondResponse.status).not.toEqual(500);
    });
  });

  describe('SSE endpoint', () => {
    beforeEach(() => {
      use.mockClear();
      send.mockClear();
    });

    it('sends invalidate events', async () => {
      const mockServerChannel = { emit: jest.fn() } as any as ServerChannel;
      useStoriesJson({
        router,
        serverChannel: mockServerChannel,
        workingDir,
        normalizedStories,
        initializedStoryIndexGenerator: getInitializedStoryIndexGenerator(),
      });

      expect(use).toHaveBeenCalledTimes(1);
      const route = use.mock.calls[0][1];

      await route(request, response);

      expect(write).not.toHaveBeenCalled();

      expect(Watchpack).toHaveBeenCalledTimes(1);
      const watcher = Watchpack.mock.instances[0];
      expect(watcher.watch).toHaveBeenCalledWith({ directories: ['./src'] });

      expect(watcher.on).toHaveBeenCalledTimes(2);
      const onChange = watcher.on.mock.calls[0][1];

      await onChange('src/nested/Button.stories.ts');
      expect(mockServerChannel.emit).toHaveBeenCalledTimes(1);
      expect(mockServerChannel.emit).toHaveBeenCalledWith(STORY_INDEX_INVALIDATED);
    });

    it('only sends one invalidation when multiple event listeners are listening', async () => {
      const mockServerChannel = { emit: jest.fn() } as any as ServerChannel;
      useStoriesJson({
        router,
        serverChannel: mockServerChannel,
        workingDir,
        normalizedStories,
        initializedStoryIndexGenerator: getInitializedStoryIndexGenerator(),
      });

      expect(use).toHaveBeenCalledTimes(1);
      const route = use.mock.calls[0][1];

      // Don't wait for the first request here before starting the second
      await Promise.all([
        route(request, response),
        route(request, { ...response, write: jest.fn() }),
      ]);

      expect(write).not.toHaveBeenCalled();

      expect(Watchpack).toHaveBeenCalledTimes(1);
      const watcher = Watchpack.mock.instances[0];
      expect(watcher.watch).toHaveBeenCalledWith({ directories: ['./src'] });

      expect(watcher.on).toHaveBeenCalledTimes(2);
      const onChange = watcher.on.mock.calls[0][1];

      await onChange('src/nested/Button.stories.ts');
      expect(mockServerChannel.emit).toHaveBeenCalledTimes(1);
      expect(mockServerChannel.emit).toHaveBeenCalledWith(STORY_INDEX_INVALIDATED);
    });

    it('debounces invalidation events', async () => {
      (debounce as jest.Mock).mockImplementation(jest.requireActual('lodash/debounce.js') as any);

      const mockServerChannel = { emit: jest.fn() } as any as ServerChannel;
      useStoriesJson({
        router,
        serverChannel: mockServerChannel,
        workingDir,
        normalizedStories,
        initializedStoryIndexGenerator: getInitializedStoryIndexGenerator(),
      });

      expect(use).toHaveBeenCalledTimes(1);
      const route = use.mock.calls[0][1];

      await route(request, response);

      expect(write).not.toHaveBeenCalled();

      expect(Watchpack).toHaveBeenCalledTimes(1);
      const watcher = Watchpack.mock.instances[0];
      expect(watcher.watch).toHaveBeenCalledWith({ directories: ['./src'] });

      expect(watcher.on).toHaveBeenCalledTimes(2);
      const onChange = watcher.on.mock.calls[0][1];

      await onChange('src/nested/Button.stories.ts');
      await onChange('src/nested/Button.stories.ts');
      await onChange('src/nested/Button.stories.ts');
      await onChange('src/nested/Button.stories.ts');
      await onChange('src/nested/Button.stories.ts');

      expect(mockServerChannel.emit).toHaveBeenCalledTimes(1);
      expect(mockServerChannel.emit).toHaveBeenCalledWith(STORY_INDEX_INVALIDATED);

      await new Promise((r) => setTimeout(r, 2 * DEBOUNCE));

      expect(mockServerChannel.emit).toHaveBeenCalledTimes(2);
    });
  });
});
