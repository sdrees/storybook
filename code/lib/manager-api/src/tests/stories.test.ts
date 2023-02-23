/// <reference types="@types/jest" />;
import {
  STORY_ARGS_UPDATED,
  UPDATE_STORY_ARGS,
  RESET_STORY_ARGS,
  SET_STORIES,
  STORY_SPECIFIED,
  STORY_PREPARED,
  STORY_INDEX_INVALIDATED,
  CONFIG_ERROR,
  SET_INDEX,
  CURRENT_STORY_WAS_SET,
  STORY_MISSING,
} from '@storybook/core-events';
import { EventEmitter } from 'events';
import { global } from '@storybook/global';

import { Channel } from '@storybook/channels';

import type { API_StoryEntry, StoryIndex, API_PreparedStoryIndex } from '@storybook/types';
import { getEventMetadata } from '../lib/events';

import { init as initStories } from '../modules/stories';
import type Store from '../store';
import type { ModuleArgs } from '..';

function mockChannel() {
  const transport = {
    setHandler: () => {},
    send: () => {},
  };

  return new Channel({ transport });
}

const mockGetEntries = jest.fn();

jest.mock('../lib/events');
jest.mock('@storybook/global', () => ({
  global: {
    ...globalThis,
    fetch: jest.fn(() => ({ json: () => ({ v: 4, entries: mockGetEntries() }) })),
    FEATURES: { storyStoreV7: true },
    CONFIG_TYPE: 'DEVELOPMENT',
  },
}));

const getEventMetadataMock = getEventMetadata as ReturnType<typeof jest.fn>;

const mockEntries: StoryIndex['entries'] = {
  'component-a--story-1': {
    type: 'story',
    id: 'component-a--story-1',
    title: 'Component A',
    name: 'Story 1',
    importPath: './path/to/component-a.ts',
  },
  'component-a--story-2': {
    type: 'story',
    id: 'component-a--story-2',
    title: 'Component A',
    name: 'Story 2',
    importPath: './path/to/component-a.ts',
  },
  'component-b--story-3': {
    type: 'story',
    id: 'component-b--story-3',
    title: 'Component B',
    name: 'Story 3',
    importPath: './path/to/component-b.ts',
  },
};

function createMockStore(initialState = {}) {
  let state = initialState;
  return {
    getState: jest.fn(() => state),
    setState: jest.fn((s: typeof state) => {
      state = { ...state, ...s };
      return Promise.resolve(state);
    }),
  } as any as Store;
}

function initStoriesAndSetState({ store, ...options }: any) {
  const { state, ...result } = initStories({ store, ...options } as any);

  // Remove deprecated fields (which would trigger warnings)
  delete state.storiesHash;
  delete state.storiesConfigured;
  delete state.storiesFailed;
  store?.setState(state);

  return { state, ...result };
}

const provider = { getConfig: jest.fn().mockReturnValue({}), serverChannel: mockChannel() };

beforeEach(() => {
  provider.getConfig.mockReset().mockReturnValue({});
  provider.serverChannel = mockChannel();
  mockGetEntries.mockReset().mockReturnValue(mockEntries);

  (global.fetch as jest.Mock<ReturnType<typeof global.fetch>>).mockReset().mockReturnValue(
    Promise.resolve({
      status: 200,
      ok: true,
      json: () => ({ v: 4, entries: mockGetEntries() }),
    } as any as Response)
  );

  getEventMetadataMock.mockReturnValue({ sourceType: 'local' } as any);
  getEventMetadataMock.mockReturnValue({ sourceType: 'local' } as any);
});

describe('stories API', () => {
  it('sets a sensible initialState', () => {
    const { state } = initStoriesAndSetState({
      storyId: 'id',
      viewMode: 'story',
    } as ModuleArgs);

    // Remove deprecated fields (which would trigger warnings)
    delete state.storiesHash;
    delete state.storiesConfigured;
    delete state.storiesFailed;

    expect(state).toEqual({
      previewInitialized: false,
      storyId: 'id',
      viewMode: 'story',
      hasCalledSetOptions: false,
    });
  });

  describe('setIndex', () => {
    it('sets the initial set of stories in the stories hash', async () => {
      const navigate = jest.fn();
      const store = createMockStore();
      const fullAPI = Object.assign(new EventEmitter());

      const { api } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
      Object.assign(fullAPI, api);

      api.setIndex({ v: 4, entries: mockEntries });
      const { index } = store.getState();

      // We need exact key ordering, even if in theory JS doesn't guarantee it
      expect(Object.keys(index)).toEqual([
        'component-a',
        'component-a--story-1',
        'component-a--story-2',
        'component-b',
        'component-b--story-3',
      ]);
      expect(index['component-a']).toMatchObject({
        type: 'component',
        id: 'component-a',
        children: ['component-a--story-1', 'component-a--story-2'],
      });

      expect(index['component-a--story-1']).toMatchObject({
        type: 'story',
        id: 'component-a--story-1',
        parent: 'component-a',
        title: 'Component A',
        name: 'Story 1',
        prepared: false,
      });
      expect(
        (index['component-a--story-1'] as API_StoryEntry as API_StoryEntry).args
      ).toBeUndefined();
    });

    it('trims whitespace of group/component names (which originate from the kind)', () => {
      const navigate = jest.fn();
      const store = createMockStore();
      const fullAPI = Object.assign(new EventEmitter());

      const { api } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
      Object.assign(fullAPI, api);

      api.setIndex({
        v: 4,
        entries: {
          'design-system-some-component--my-story': {
            type: 'story',
            id: 'design-system-some-component--my-story',
            title: '  Design System  /  Some Component  ', // note the leading/trailing whitespace around each part of the path
            name: '  My Story  ', // we only trim the path, so this will be kept as-is (it may intentionally have whitespace)
            importPath: './path/to/some-component.ts',
          },
        },
      });
      const { index } = store.getState();

      // We need exact key ordering, even if in theory JS doesn't guarantee it
      expect(Object.keys(index)).toEqual([
        'design-system',
        'design-system-some-component',
        'design-system-some-component--my-story',
      ]);
      expect(index['design-system']).toMatchObject({
        type: 'root',
        name: 'Design System', // root name originates from `kind`, so it gets trimmed
      });
      expect(index['design-system-some-component']).toMatchObject({
        type: 'component',
        name: 'Some Component', // component name originates from `kind`, so it gets trimmed
      });
      expect(index['design-system-some-component--my-story']).toMatchObject({
        type: 'story',
        title: '  Design System  /  Some Component  ', // title is kept as-is, because it may be used as identifier
        name: '  My Story  ', // story name is kept as-is, because it's set directly on the story
      });
    });

    it('moves rootless stories to the front of the list', async () => {
      const navigate = jest.fn();
      const store = createMockStore();
      const fullAPI = Object.assign(new EventEmitter());

      const { api } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
      Object.assign(fullAPI, api);

      api.setIndex({
        v: 4,
        entries: {
          'root-first--story-1': {
            type: 'story',
            id: 'root-first--story-1',
            title: 'Root/First',
            name: 'Story 1',
            importPath: './path/to/root/first.ts',
          },
          ...mockEntries,
        },
      });
      const { index } = store.getState();

      // We need exact key ordering, even if in theory JS doesn't guarantee it
      expect(Object.keys(index)).toEqual([
        'component-a',
        'component-a--story-1',
        'component-a--story-2',
        'component-b',
        'component-b--story-3',
        'root',
        'root-first',
        'root-first--story-1',
      ]);
      expect(index.root).toMatchObject({
        type: 'root',
        id: 'root',
        children: ['root-first'],
      });
    });

    it('sets roots when showRoots = true', () => {
      const navigate = jest.fn();
      const store = createMockStore();
      const fullAPI = Object.assign(new EventEmitter());

      const { api } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
      Object.assign(fullAPI, api);

      provider.getConfig.mockReturnValue({ sidebar: { showRoots: true } });
      api.setIndex({
        v: 4,
        entries: {
          'a-b--1': {
            type: 'story',
            id: 'a-b--1',
            title: 'a/b',
            name: '1',
            importPath: './a/b.ts',
          },
        },
      });

      const { index } = store.getState();

      // We need exact key ordering, even if in theory JS doens't guarantee it
      expect(Object.keys(index)).toEqual(['a', 'a-b', 'a-b--1']);
      expect(index.a).toMatchObject({
        type: 'root',
        id: 'a',
        children: ['a-b'],
      });
      expect(index['a-b']).toMatchObject({
        type: 'component',
        id: 'a-b',
        parent: 'a',
        children: ['a-b--1'],
      });
      expect(index['a-b--1']).toMatchObject({
        type: 'story',
        id: 'a-b--1',
        parent: 'a-b',
        name: '1',
        title: 'a/b',
      });
    });

    it('does not put bare stories into a root when showRoots = true', () => {
      const navigate = jest.fn();
      const store = createMockStore();
      const fullAPI = Object.assign(new EventEmitter());

      const { api } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
      Object.assign(fullAPI, api);

      provider.getConfig.mockReturnValue({ sidebar: { showRoots: true } });
      api.setIndex({
        v: 4,
        entries: {
          'a--1': {
            type: 'story',
            id: 'a--1',
            title: 'a',
            name: '1',
            importPath: './a.ts',
          },
        },
      });

      const { index } = store.getState();

      // We need exact key ordering, even if in theory JS doens't guarantee it
      expect(Object.keys(index)).toEqual(['a', 'a--1']);
      expect(index.a).toMatchObject({
        type: 'component',
        id: 'a',
        children: ['a--1'],
      });
      expect(index['a--1']).toMatchObject({
        type: 'story',
        id: 'a--1',
        parent: 'a',
        title: 'a',
        name: '1',
      });
    });

    // Stories can get out of order for a few reasons -- see reproductions on
    //   https://github.com/storybookjs/storybook/issues/5518
    it('does the right thing for out of order stories', async () => {
      const navigate = jest.fn();
      const store = createMockStore();
      const fullAPI = Object.assign(new EventEmitter());

      const { api } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
      Object.assign(fullAPI, api);

      provider.getConfig.mockReturnValue({ sidebar: { showRoots: true } });
      api.setIndex({
        v: 4,
        entries: {
          'a--1': { type: 'story', title: 'a', name: '1', id: 'a--1', importPath: './a.ts' },
          'b--1': { type: 'story', title: 'b', name: '1', id: 'b--1', importPath: './b.ts' },
          'a--2': { type: 'story', title: 'a', name: '2', id: 'a--2', importPath: './a.ts' },
        },
      });

      const { index } = store.getState();

      // We need exact key ordering, even if in theory JS doens't guarantee it
      expect(Object.keys(index)).toEqual(['a', 'a--1', 'a--2', 'b', 'b--1']);
      expect(index.a).toMatchObject({
        type: 'component',
        id: 'a',
        children: ['a--1', 'a--2'],
      });

      expect(index.b).toMatchObject({
        type: 'component',
        id: 'b',
        children: ['b--1'],
      });
    });

    // Entries on the SET_STORIES event will be prepared
    it('handles properly prepared stories', async () => {
      const navigate = jest.fn();
      const store = createMockStore();
      const fullAPI = Object.assign(new EventEmitter());

      const { api } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
      Object.assign(fullAPI, api);

      api.setIndex({
        v: 4,
        entries: {
          'prepared--story': {
            type: 'story',
            id: 'prepared--story',
            title: 'Prepared',
            name: 'Story',
            importPath: './path/to/prepared.ts',
            parameters: { parameter: 'exists' },
            args: { arg: 'exists' },
          },
        },
      });

      const { index } = store.getState();

      expect(index['prepared--story']).toMatchObject({
        type: 'story',
        id: 'prepared--story',
        parent: 'prepared',
        title: 'Prepared',
        name: 'Story',
        prepared: true,
        parameters: { parameter: 'exists' },
        args: { arg: 'exists' },
      });
    });

    it('retains prepared-ness of stories', async () => {
      const navigate = jest.fn();
      const store = createMockStore();
      const fullAPI = Object.assign(new EventEmitter(), { setOptions: jest.fn() });

      const { api, init } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
      Object.assign(fullAPI, api);
      init();

      api.setIndex({ v: 4, entries: mockEntries });

      fullAPI.emit(STORY_PREPARED, {
        id: 'component-a--story-1',
        parameters: { a: 'b' },
        args: { c: 'd' },
      });
      // Let the promise/await chain resolve
      await new Promise((r) => setTimeout(r, 0));
      expect(store.getState().index['component-a--story-1'] as API_StoryEntry).toMatchObject({
        prepared: true,
        parameters: { a: 'b' },
        args: { c: 'd' },
      });

      api.setIndex({ v: 4, entries: mockEntries });

      // Let the promise/await chain resolve
      await new Promise((r) => setTimeout(r, 0));
      expect(store.getState().index['component-a--story-1'] as API_StoryEntry).toMatchObject({
        prepared: true,
        parameters: { a: 'b' },
        args: { c: 'd' },
      });
    });

    describe('docs entries', () => {
      const docsEntries: StoryIndex['entries'] = {
        'component-a--page': {
          type: 'story',
          id: 'component-a--page',
          title: 'Component A',
          name: 'Page',
          importPath: './path/to/component-a.ts',
        },
        'component-a--story-2': {
          type: 'story',
          id: 'component-a--story-2',
          title: 'Component A',
          name: 'Story 2',
          importPath: './path/to/component-a.ts',
        },
        'component-b-docs': {
          type: 'docs',
          id: 'component-b--docs',
          title: 'Component B',
          name: 'Docs',
          importPath: './path/to/component-b.ts',
          storiesImports: [],
          tags: ['stories-mdx'],
        },
        'component-c--story-4': {
          type: 'story',
          id: 'component-c--story-4',
          title: 'Component c',
          name: 'Story 4',
          importPath: './path/to/component-c.ts',
        },
      };

      it('handles docs entries', async () => {
        const navigate = jest.fn();
        const store = createMockStore();
        const fullAPI = Object.assign(new EventEmitter());

        const { api } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
        Object.assign(fullAPI, api);

        api.setIndex({ v: 4, entries: docsEntries });

        const { index } = store.getState();

        // We need exact key ordering, even if in theory JS doesn't guarantee it
        expect(Object.keys(index)).toEqual([
          'component-a',
          'component-a--page',
          'component-a--story-2',
          'component-b',
          'component-b--docs',
          'component-c',
          'component-c--story-4',
        ]);
        expect(index['component-a--page'].type).toBe('story');
        expect(index['component-a--story-2'].type).toBe('story');
        expect(index['component-b--docs'].type).toBe('docs');
        expect(index['component-c--story-4'].type).toBe('story');
      });

      describe('when DOCS_MODE = true', () => {
        it('strips out story entries', async () => {
          const navigate = jest.fn();
          const store = createMockStore();
          const fullAPI = Object.assign(new EventEmitter());

          const { api } = initStoriesAndSetState({
            store,
            navigate,
            provider,
            fullAPI,
            docsOptions: { docsMode: true },
          } as any);
          Object.assign(fullAPI, api);

          api.setIndex({ v: 4, entries: docsEntries });

          const { index } = store.getState();

          expect(Object.keys(index)).toEqual(['component-b', 'component-b--docs']);
        });
      });
    });
  });

  describe('SET_INDEX event', () => {
    it('calls setIndex w/ the data', () => {
      const fullAPI = Object.assign(new EventEmitter());
      const navigate = jest.fn();
      const store = createMockStore();

      const { init, api } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
      Object.assign(fullAPI, api, {
        setIndex: jest.fn(),
        setOptions: jest.fn(),
      });
      init();

      fullAPI.emit(SET_INDEX, { v: 4, entries: mockEntries });

      expect(fullAPI.setIndex).toHaveBeenCalled();
    });

    it('calls setOptions w/ first story parameter', () => {
      const fullAPI = Object.assign(new EventEmitter());
      const navigate = jest.fn();
      const store = createMockStore();

      const { init, api } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
      Object.assign(fullAPI, api, {
        setIndex: jest.fn(),
        setOptions: jest.fn(),
        getCurrentParameter: jest.fn().mockReturnValue('options'),
      });
      init();

      fullAPI.emit(SET_INDEX, { v: 4, entries: mockEntries });

      expect(fullAPI.setOptions).toHaveBeenCalledWith('options');
    });
  });

  describe('fetchIndex', () => {
    it('deals with 500 errors', async () => {
      const navigate = jest.fn();
      const store = createMockStore({});
      const fullAPI = Object.assign(new EventEmitter(), {});

      (global.fetch as jest.Mock<ReturnType<typeof global.fetch>>).mockReturnValue(
        Promise.resolve({
          status: 500,
          text: async () => new Error('sorting error'),
        } as any as Response)
      );
      const { api, init } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
      Object.assign(fullAPI, api);

      await init();

      const { indexError } = store.getState();
      expect(indexError).toBeDefined();
    });

    it('watches for the INVALIDATE event and refetches -- and resets the hash', async () => {
      const navigate = jest.fn();
      const store = createMockStore();
      const fullAPI = Object.assign(new EventEmitter(), {
        setIndex: jest.fn(),
      });

      const { api, init } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
      Object.assign(fullAPI, api);

      (global.fetch as jest.Mock<ReturnType<typeof global.fetch>>).mockClear();
      await init();
      expect(global.fetch as jest.Mock<ReturnType<typeof global.fetch>>).toHaveBeenCalledTimes(1);

      (global.fetch as jest.Mock<ReturnType<typeof global.fetch>>).mockClear();
      mockGetEntries.mockReturnValueOnce({
        'component-a--story-1': {
          type: 'story',
          id: 'component-a--story-1',
          title: 'Component A',
          name: 'Story 1',
          importPath: './path/to/component-a.ts',
        },
      });
      provider.serverChannel.emit(STORY_INDEX_INVALIDATED);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Let the promise/await chain resolve
      await new Promise((r) => setTimeout(r, 0));
      const { index } = store.getState();

      expect(Object.keys(index)).toEqual(['component-a', 'component-a--story-1']);
    });

    it('clears 500 errors when invalidated', async () => {
      const navigate = jest.fn();
      const store = createMockStore();
      const fullAPI = Object.assign(new EventEmitter(), {
        setIndex: jest.fn(),
      });

      (global.fetch as jest.Mock<ReturnType<typeof global.fetch>>).mockReturnValueOnce(
        Promise.resolve({
          status: 500,
          text: async () => new Error('sorting error'),
        } as any as Response)
      );
      const { api, init } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
      Object.assign(fullAPI, api);

      await init();

      const { indexError } = store.getState();
      expect(indexError).toBeDefined();

      (global.fetch as jest.Mock<ReturnType<typeof global.fetch>>).mockClear();
      mockGetEntries.mockReturnValueOnce({
        'component-a--story-1': {
          type: 'story',
          id: 'component-a--story-1',
          title: 'Component A',
          name: 'Story 1',
          importPath: './path/to/component-a.ts',
        },
      });
      provider.serverChannel.emit(STORY_INDEX_INVALIDATED);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Let the promise/await chain resolve
      await new Promise((r) => setTimeout(r, 0));
      const { index, indexError: newIndexError } = store.getState();
      expect(newIndexError).not.toBeDefined();

      expect(Object.keys(index)).toEqual(['component-a', 'component-a--story-1']);
    });
  });

  describe('STORY_SPECIFIED event', () => {
    it('navigates to the story', async () => {
      const navigate = jest.fn();
      const fullAPI = Object.assign(new EventEmitter(), {
        isSettingsScreenActive() {
          return false;
        },
      });
      const store = createMockStore({});
      const { init, api } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);

      Object.assign(fullAPI, api);
      init();
      fullAPI.emit(STORY_SPECIFIED, { storyId: 'a--1', viewMode: 'story' });

      expect(navigate).toHaveBeenCalledWith('/story/a--1');
    });

    it('DOES not navigate if the story was already selected', async () => {
      const navigate = jest.fn();
      const fullAPI = Object.assign(new EventEmitter(), {
        isSettingsScreenActive() {
          return true;
        },
      });
      const store = createMockStore({ viewMode: 'story', storyId: 'a--1' });
      initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);

      fullAPI.emit(STORY_SPECIFIED, { storyId: 'a--1', viewMode: 'story' });

      expect(navigate).not.toHaveBeenCalled();
    });

    it('DOES not navigate if a settings page was selected', async () => {
      const navigate = jest.fn();
      const fullAPI = Object.assign(new EventEmitter(), {
        isSettingsScreenActive() {
          return true;
        },
      });
      const store = createMockStore({ viewMode: 'settings', storyId: 'about' });
      initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);

      fullAPI.emit(STORY_SPECIFIED, { storyId: 'a--1', viewMode: 'story' });

      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe('CURRENT_STORY_WAS_SET event', () => {
    it('sets previewInitialized', async () => {
      const navigate = jest.fn();
      const fullAPI = Object.assign(new EventEmitter());
      const store = createMockStore({});
      const { init, api } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);

      Object.assign(fullAPI, api);
      await init();
      fullAPI.emit(CURRENT_STORY_WAS_SET, { id: 'a--1' });

      expect(store.getState().previewInitialized).toBe(true);
    });

    it('sets a ref to previewInitialized', async () => {
      const navigate = jest.fn();
      const fullAPI = Object.assign(new EventEmitter(), { updateRef: jest.fn() });
      const store = createMockStore();
      const { api, init } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);

      Object.assign(fullAPI, api);

      getEventMetadataMock.mockReturnValueOnce({
        sourceType: 'external',
        ref: { id: 'refId', index: { 'a--1': { args: { a: 'b' } } } },
      } as any);
      await init();
      fullAPI.emit(CURRENT_STORY_WAS_SET, { id: 'a--1' });

      expect(fullAPI.updateRef.mock.calls.length).toBe(1);

      expect(fullAPI.updateRef.mock.calls[0][1]).toEqual({
        previewInitialized: true,
      });
    });
  });

  describe('args handling', () => {
    const parameters = {};
    const preparedEntries: API_PreparedStoryIndex['entries'] = {
      'a--1': {
        type: 'story',
        title: 'a',
        name: '1',
        parameters,
        id: 'a--1',
        args: { a: 'b' },
        importPath: './a.ts',
      },
      'b--1': {
        type: 'story',
        title: 'b',
        name: '1',
        parameters,
        id: 'b--1',
        args: { x: 'y' },
        importPath: './b.ts',
      },
    };

    it('changes args properly, per story when receiving STORY_ARGS_UPDATED', () => {
      const navigate = jest.fn();
      const store = createMockStore();
      const fullAPI = new EventEmitter();

      const { api, init } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);

      const { setIndex } = Object.assign(fullAPI, api);
      setIndex({ v: 4, entries: preparedEntries });

      const { index } = store.getState();
      expect((index['a--1'] as API_StoryEntry).args).toEqual({ a: 'b' });
      expect((index['b--1'] as API_StoryEntry).args).toEqual({ x: 'y' });

      init();
      fullAPI.emit(STORY_ARGS_UPDATED, { storyId: 'a--1', args: { foo: 'bar' } });

      const { index: changedIndex } = store.getState();
      expect((changedIndex['a--1'] as API_StoryEntry).args).toEqual({ foo: 'bar' });
      expect((changedIndex['b--1'] as API_StoryEntry).args).toEqual({ x: 'y' });
    });

    it('changes reffed args properly, per story when receiving STORY_ARGS_UPDATED', () => {
      const navigate = jest.fn();
      const store = createMockStore();
      const fullAPI = new EventEmitter();

      const { init, api } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
      Object.assign(fullAPI, api, {
        updateRef: jest.fn(),
      });

      init();
      getEventMetadataMock.mockReturnValueOnce({
        sourceType: 'external',
        ref: { id: 'refId', index: { 'a--1': { args: { a: 'b' } } } },
      } as any);
      fullAPI.emit(STORY_ARGS_UPDATED, { storyId: 'a--1', args: { foo: 'bar' } });
      expect((fullAPI as any).updateRef).toHaveBeenCalledWith('refId', {
        index: { 'a--1': { args: { foo: 'bar' } } },
      });
    });

    it('updateStoryArgs emits UPDATE_STORY_ARGS to the local frame and does not change anything', () => {
      const navigate = jest.fn();
      const emit = jest.fn();
      const on = jest.fn();
      const fullAPI = { emit, on };
      const store = createMockStore();

      const { api, init } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
      const { setIndex } = Object.assign(fullAPI, api);
      setIndex({ v: 4, entries: preparedEntries });

      init();

      api.updateStoryArgs({ id: 'a--1' } as API_StoryEntry, { foo: 'bar' });
      expect(emit).toHaveBeenCalledWith(UPDATE_STORY_ARGS, {
        storyId: 'a--1',
        updatedArgs: { foo: 'bar' },
        options: {
          target: undefined,
        },
      });

      const { index } = store.getState();
      expect((index['a--1'] as API_StoryEntry).args).toEqual({ a: 'b' });
      expect((index['b--1'] as API_StoryEntry).args).toEqual({ x: 'y' });
    });

    it('updateStoryArgs emits UPDATE_STORY_ARGS to the right frame', () => {
      const navigate = jest.fn();
      const emit = jest.fn();
      const on = jest.fn();
      const fullAPI = { emit, on };
      const store = createMockStore();

      const { api, init } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);

      const { setIndex } = Object.assign(fullAPI, api);
      setIndex({ v: 4, entries: preparedEntries });

      init();

      api.updateStoryArgs({ id: 'a--1', refId: 'refId' } as API_StoryEntry, { foo: 'bar' });
      expect(emit).toHaveBeenCalledWith(UPDATE_STORY_ARGS, {
        storyId: 'a--1',
        updatedArgs: { foo: 'bar' },
        options: {
          target: 'refId',
        },
      });
    });

    it('refId to the local frame and does not change anything', () => {
      const navigate = jest.fn();
      const emit = jest.fn();
      const on = jest.fn();
      const fullAPI = { emit, on };
      const store = createMockStore();

      const { api, init } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);

      const { setIndex } = Object.assign(fullAPI, api);
      setIndex({ v: 4, entries: preparedEntries });
      init();

      api.resetStoryArgs({ id: 'a--1' } as API_StoryEntry, ['foo']);
      expect(emit).toHaveBeenCalledWith(RESET_STORY_ARGS, {
        storyId: 'a--1',
        argNames: ['foo'],
        options: {
          target: undefined,
        },
      });

      const { index } = store.getState();
      expect((index['a--1'] as API_StoryEntry).args).toEqual({ a: 'b' });
      expect((index['b--1'] as API_StoryEntry).args).toEqual({ x: 'y' });
    });

    it('resetStoryArgs emits RESET_STORY_ARGS to the right frame', () => {
      const navigate = jest.fn();
      const emit = jest.fn();
      const on = jest.fn();
      const fullAPI = { emit, on };
      const store = createMockStore();

      const { api, init } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);

      const { setIndex } = Object.assign(fullAPI, api);
      setIndex({ v: 4, entries: preparedEntries });
      init();

      api.resetStoryArgs({ id: 'a--1', refId: 'refId' } as API_StoryEntry, ['foo']);
      expect(emit).toHaveBeenCalledWith(RESET_STORY_ARGS, {
        storyId: 'a--1',
        argNames: ['foo'],
        options: {
          target: 'refId',
        },
      });
    });
  });

  const navigationEntries: StoryIndex['entries'] = {
    'a--1': {
      type: 'story',
      title: 'a',
      name: '1',
      id: 'a--1',
      importPath: './a.ts',
    },
    'a--2': {
      type: 'story',
      title: 'a',
      name: '2',
      id: 'a--2',
      importPath: './a.ts',
    },
    'b-c--1': {
      type: 'story',
      title: 'b/c',
      name: '1',
      id: 'b-c--1',
      importPath: './b/c.ts',
    },
    'b-d--1': {
      type: 'story',
      title: 'b/d',
      name: '1',
      id: 'b-d--1',
      importPath: './b/d.ts',
    },
    'b-d--2': {
      type: 'story',
      title: 'b/d',
      name: '2',
      id: 'b-d--2',
      importPath: './b/d.ts',
    },
    'custom-id--1': {
      type: 'story',
      title: 'b/e',
      name: '1',
      id: 'custom-id--1',
      importPath: './b/.ts',
    },
  };

  describe('jumpToStory', () => {
    it('works forward', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setIndex, jumpToStory },
      } = initStoriesAndSetState({
        store,
        storyId: 'a--1',
        viewMode: 'story',
        navigate,
        provider,
      } as any);
      setIndex({ v: 4, entries: navigationEntries });

      jumpToStory(1);
      expect(navigate).toHaveBeenCalledWith('/story/a--2');
    });

    it('works backwards', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setIndex, jumpToStory },
      } = initStoriesAndSetState({
        store,
        storyId: 'a--2',
        viewMode: 'story',
        navigate,
        provider,
      } as any);
      setIndex({ v: 4, entries: navigationEntries });

      jumpToStory(-1);
      expect(navigate).toHaveBeenCalledWith('/story/a--1');
    });

    it('does nothing if you are at the last story and go forward', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setIndex, jumpToStory },
      } = initStoriesAndSetState({
        store,
        storyId: 'custom-id--1',
        viewMode: 'story',
        navigate,
        provider,
      } as any);
      setIndex({ v: 4, entries: navigationEntries });

      jumpToStory(1);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('does nothing if you are at the first story and go backward', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setIndex, jumpToStory },
      } = initStoriesAndSetState({
        store,
        storyId: 'a--1',
        viewMode: 'story',
        navigate,
        provider,
      } as any);
      setIndex({ v: 4, entries: navigationEntries });

      jumpToStory(-1);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('does nothing if you have not selected a story', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setIndex, jumpToStory },
      } = initStoriesAndSetState({ store, navigate, provider } as any);
      setIndex({ v: 4, entries: navigationEntries });

      jumpToStory(1);
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe('findSiblingStoryId', () => {
    it('works forward', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const storyId = 'a--1';
      const {
        api: { setIndex, findSiblingStoryId },
      } = initStoriesAndSetState({ store, navigate, storyId, viewMode: 'story', provider } as any);
      setIndex({ v: 4, entries: navigationEntries });

      const result = findSiblingStoryId(storyId, store.getState().index, 1, false);
      expect(result).toBe('a--2');
    });
    it('works forward toSiblingGroup', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const storyId = 'a--1';
      const {
        api: { setIndex, findSiblingStoryId },
      } = initStoriesAndSetState({ store, navigate, storyId, viewMode: 'story', provider } as any);
      setIndex({ v: 4, entries: navigationEntries });

      const result = findSiblingStoryId(storyId, store.getState().index, 1, true);
      expect(result).toBe('b-c--1');
    });
  });
  describe('jumpToComponent', () => {
    it('works forward', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setIndex, jumpToComponent },
      } = initStoriesAndSetState({
        store,
        navigate,
        storyId: 'a--1',
        viewMode: 'story',
        provider,
      } as any);
      setIndex({ v: 4, entries: navigationEntries });

      jumpToComponent(1);
      expect(navigate).toHaveBeenCalledWith('/story/b-c--1');
    });

    it('works backwards', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setIndex, jumpToComponent },
      } = initStoriesAndSetState({
        store,
        navigate,
        storyId: 'b-c--1',
        viewMode: 'story',
        provider,
      } as any);
      setIndex({ v: 4, entries: navigationEntries });

      jumpToComponent(-1);
      expect(navigate).toHaveBeenCalledWith('/story/a--1');
    });

    it('does nothing if you are in the last component and go forward', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setIndex, jumpToComponent },
      } = initStoriesAndSetState({
        store,
        navigate,
        storyId: 'custom-id--1',
        viewMode: 'story',
        provider,
      } as any);
      setIndex({ v: 4, entries: navigationEntries });

      jumpToComponent(1);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('does nothing if you are at the first component and go backward', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setIndex, jumpToComponent },
      } = initStoriesAndSetState({
        store,
        navigate,
        storyId: 'a--2',
        viewMode: 'story',
        provider,
      } as any);
      setIndex({ v: 4, entries: navigationEntries });

      jumpToComponent(-1);
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe('selectStory', () => {
    it('navigates', () => {
      const navigate = jest.fn();
      const store = createMockStore({ storyId: 'a--1', viewMode: 'story' });
      const {
        api: { setIndex, selectStory },
      } = initStoriesAndSetState({ store, navigate, provider } as any);
      setIndex({ v: 4, entries: navigationEntries });

      selectStory('a--2');
      expect(navigate).toHaveBeenCalledWith('/story/a--2');
    });

    it('sets view mode to docs if doc-level component is selected', () => {
      const navigate = jest.fn();
      const store = createMockStore({ storyId: 'a--1', viewMode: 'docs' });
      const {
        api: { setIndex, selectStory },
      } = initStoriesAndSetState({ store, navigate, provider } as any);
      setIndex({
        v: 4,
        entries: {
          ...navigationEntries,
          'intro--docs': {
            type: 'docs',
            id: 'intro--docs',
            title: 'Intro',
            name: 'Page',
            importPath: './intro.mdx',
            storiesImports: [],
          },
        },
      });

      selectStory('intro');
      expect(navigate).toHaveBeenCalledWith('/docs/intro--docs');
    });

    describe('legacy api', () => {
      it('allows navigating to a combination of title + name', () => {
        const navigate = jest.fn();
        const store = createMockStore();
        const {
          api: { setIndex, selectStory },
        } = initStoriesAndSetState({
          store,
          storyId: 'a--1',
          viewMode: 'story',
          navigate,
          provider,
        } as any);
        setIndex({ v: 4, entries: navigationEntries });

        selectStory('a', '2');
        expect(navigate).toHaveBeenCalledWith('/story/a--2');
      });

      it('allows navigating to a given name (in the current component)', () => {
        const navigate = jest.fn();
        const store = createMockStore();
        const {
          api: { setIndex, selectStory },
        } = initStoriesAndSetState({
          store,
          storyId: 'a--1',
          viewMode: 'story',
          navigate,
          provider,
        } as any);
        setIndex({ v: 4, entries: navigationEntries });

        selectStory(undefined, '2');
        expect(navigate).toHaveBeenCalledWith('/story/a--2');
      });
    });

    it('allows navigating away from the settings pages', () => {
      const navigate = jest.fn();
      const store = createMockStore({ storyId: 'a--1', viewMode: 'settings' });
      const {
        api: { setIndex, selectStory },
      } = initStoriesAndSetState({ store, navigate, provider } as any);
      setIndex({ v: 4, entries: navigationEntries });

      selectStory('a--2');
      expect(navigate).toHaveBeenCalledWith('/story/a--2');
    });

    it('allows navigating to first story in component on call by component id', () => {
      const navigate = jest.fn();
      const store = createMockStore();
      const {
        api: { setIndex, selectStory },
      } = initStoriesAndSetState({
        store,
        storyId: 'a--1',
        viewMode: 'story',
        navigate,
        provider,
      } as any);
      setIndex({ v: 4, entries: navigationEntries });

      selectStory('a');
      expect(navigate).toHaveBeenCalledWith('/story/a--1');
    });

    it('allows navigating to first story in group on call by group id', () => {
      const navigate = jest.fn();
      const store = createMockStore();
      const {
        api: { setIndex, selectStory },
      } = initStoriesAndSetState({
        store,
        storyId: 'a--1',
        viewMode: 'story',
        navigate,
        provider,
      } as any);
      setIndex({ v: 4, entries: navigationEntries });

      selectStory('b');
      expect(navigate).toHaveBeenCalledWith('/story/b-c--1');
    });

    it('allows navigating to first story in component on call by title', () => {
      const navigate = jest.fn();
      const store = createMockStore();
      const {
        api: { setIndex, selectStory },
      } = initStoriesAndSetState({
        store,
        storyId: 'a--1',
        viewMode: 'story',
        navigate,
        provider,
      } as any);
      setIndex({ v: 4, entries: navigationEntries });

      selectStory('A');
      expect(navigate).toHaveBeenCalledWith('/story/a--1');
    });

    it('allows navigating to the first story of the current component if passed nothing', () => {
      const navigate = jest.fn();
      const store = createMockStore();
      const {
        api: { setIndex, selectStory },
      } = initStoriesAndSetState({
        store,
        storyId: 'a--2',
        viewMode: 'story',
        navigate,
        provider,
      } as any);
      setIndex({ v: 4, entries: navigationEntries });

      selectStory();
      expect(navigate).toHaveBeenCalledWith('/story/a--1');
    });

    describe('component permalinks', () => {
      it('allows navigating to kind/storyname (legacy api)', () => {
        const navigate = jest.fn();
        const store = createMockStore();

        const {
          api: { selectStory, setIndex },
        } = initStoriesAndSetState({ store, navigate, provider } as any);
        setIndex({ v: 4, entries: navigationEntries });

        selectStory('b/e', '1');
        expect(navigate).toHaveBeenCalledWith('/story/custom-id--1');
      });

      it('allows navigating to component permalink/storyname (legacy api)', () => {
        const navigate = jest.fn();
        const store = createMockStore();

        const {
          api: { selectStory, setIndex },
        } = initStoriesAndSetState({ store, navigate, provider } as any);
        setIndex({ v: 4, entries: navigationEntries });

        selectStory('custom-id', '1');
        expect(navigate).toHaveBeenCalledWith('/story/custom-id--1');
      });

      it('allows navigating to first story in kind on call by kind', () => {
        const navigate = jest.fn();
        const store = createMockStore();

        const {
          api: { selectStory, setIndex },
        } = initStoriesAndSetState({ store, navigate, provider } as any);
        setIndex({ v: 4, entries: navigationEntries });

        selectStory('b/e');
        expect(navigate).toHaveBeenCalledWith('/story/custom-id--1');
      });
    });
  });

  describe('STORY_PREPARED', () => {
    it('prepares the story', async () => {
      const navigate = jest.fn();
      const store = createMockStore();
      const fullAPI = Object.assign(new EventEmitter(), {
        setStories: jest.fn(),
        setOptions: jest.fn(),
      });

      const { api, init } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
      Object.assign(fullAPI, api);

      await init();
      fullAPI.emit(STORY_PREPARED, {
        id: 'component-a--story-1',
        parameters: { a: 'b' },
        args: { c: 'd' },
      });

      const { index } = store.getState();
      expect(index['component-a--story-1']).toMatchObject({
        type: 'story',
        id: 'component-a--story-1',
        parent: 'component-a',
        title: 'Component A',
        name: 'Story 1',
        prepared: true,
        parameters: { a: 'b' },
        args: { c: 'd' },
      });
    });

    it('sets options the first time it is called', async () => {
      const navigate = jest.fn();
      const store = createMockStore();
      const fullAPI = Object.assign(new EventEmitter(), {
        setStories: jest.fn(),
        setOptions: jest.fn(),
      });

      const { api, init } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
      Object.assign(fullAPI, api);

      await init();
      fullAPI.emit(STORY_PREPARED, {
        id: 'component-a--story-1',
        parameters: { options: 'options' },
      });

      expect(fullAPI.setOptions).toHaveBeenCalledWith('options');

      fullAPI.setOptions.mockClear();
      fullAPI.emit(STORY_PREPARED, {
        id: 'component-a--story-1',
        parameters: { options: 'options2' },
      });

      expect(fullAPI.setOptions).not.toHaveBeenCalled();
    });
  });

  describe('CONFIG_ERROR', () => {
    it('sets previewInitialized to true, local', async () => {
      const navigate = jest.fn();
      const store = createMockStore();
      const fullAPI = Object.assign(new EventEmitter(), {});

      const { api, init } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
      Object.assign(fullAPI, api);

      await init();

      fullAPI.emit(CONFIG_ERROR, { message: 'Failed to run configure' });

      const { previewInitialized } = store.getState();
      expect(previewInitialized).toBe(true);
    });

    it('sets previewInitialized to true, ref', async () => {
      const navigate = jest.fn();
      const fullAPI = Object.assign(new EventEmitter(), { updateRef: jest.fn() });
      const store = createMockStore();
      const { api, init } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);

      Object.assign(fullAPI, api);

      getEventMetadataMock.mockReturnValueOnce({
        sourceType: 'external',
        ref: { id: 'refId', stories: { 'a--1': { args: { a: 'b' } } } },
      } as any);
      await init();
      fullAPI.emit(CONFIG_ERROR, { message: 'Failed to run configure' });

      expect(fullAPI.updateRef.mock.calls.length).toBe(1);
      expect(fullAPI.updateRef.mock.calls[0][1]).toEqual({
        previewInitialized: true,
      });
    });
  });

  describe('STORY_MISSING', () => {
    it('sets previewInitialized to true, local', async () => {
      const navigate = jest.fn();
      const store = createMockStore();
      const fullAPI = Object.assign(new EventEmitter(), {});

      const { api, init } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
      Object.assign(fullAPI, api);

      await init();

      fullAPI.emit(STORY_MISSING, { message: 'Failed to run configure' });

      const { previewInitialized } = store.getState();
      expect(previewInitialized).toBe(true);
    });

    it('sets previewInitialized to true, ref', async () => {
      const navigate = jest.fn();
      const fullAPI = Object.assign(new EventEmitter(), { updateRef: jest.fn() });
      const store = createMockStore();
      const { api, init } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);

      Object.assign(fullAPI, api);

      getEventMetadataMock.mockReturnValueOnce({
        sourceType: 'external',
        ref: { id: 'refId', stories: { 'a--1': { args: { a: 'b' } } } },
      } as any);
      await init();
      fullAPI.emit(STORY_MISSING, { message: 'Failed to run configure' });

      expect(fullAPI.updateRef.mock.calls.length).toBe(1);
      expect(fullAPI.updateRef.mock.calls[0][1]).toEqual({
        previewInitialized: true,
      });
    });
  });

  describe('v2 SET_STORIES event', () => {
    it('normalizes parameters and calls setRef for external stories', () => {
      const fullAPI = Object.assign(new EventEmitter());
      const navigate = jest.fn();
      const store = createMockStore();

      const { init, api } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
      Object.assign(fullAPI, api, {
        setIndex: jest.fn(),
        findRef: jest.fn(),
        setRef: jest.fn(),
      });
      init();

      getEventMetadataMock.mockReturnValueOnce({
        sourceType: 'external',
        ref: { id: 'ref' },
      } as any);
      const setStoriesPayload = {
        v: 2,
        globalParameters: { global: 'global' },
        kindParameters: { a: { kind: 'kind' } },
        stories: { 'a--1': { kind: 'a', parameters: { story: 'story' } } },
      };
      fullAPI.emit(SET_STORIES, setStoriesPayload);

      expect(fullAPI.setIndex).not.toHaveBeenCalled();
      expect(fullAPI.setRef).toHaveBeenCalledWith(
        'ref',
        {
          id: 'ref',
          setStoriesData: {
            'a--1': { kind: 'a', parameters: { global: 'global', kind: 'kind', story: 'story' } },
          },
        },
        true
      );
    });
  });
  describe('legacy (v1) SET_STORIES event', () => {
    it('calls setRef with stories', () => {
      const fullAPI = Object.assign(new EventEmitter());
      const navigate = jest.fn();
      const store = createMockStore();

      const { init, api } = initStoriesAndSetState({ store, navigate, provider, fullAPI } as any);
      Object.assign(fullAPI, api, {
        setIndex: jest.fn(),
        findRef: jest.fn(),
        setRef: jest.fn(),
      });
      init();

      getEventMetadataMock.mockReturnValueOnce({
        sourceType: 'external',
        ref: { id: 'ref' },
      } as any);
      const setStoriesPayload = {
        stories: { 'a--1': {} },
      };
      fullAPI.emit(SET_STORIES, setStoriesPayload);

      expect(fullAPI.setIndex).not.toHaveBeenCalled();
      expect(fullAPI.setRef).toHaveBeenCalledWith(
        'ref',
        {
          id: 'ref',
          setStoriesData: {
            'a--1': {},
          },
        },
        true
      );
    });
  });
});
