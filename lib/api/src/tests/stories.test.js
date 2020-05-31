import EventEmitter from 'event-emitter';
import { STORY_ARGS_UPDATED, UPDATE_STORY_ARGS, SET_STORIES } from '@storybook/core-events';

import { init as initStories } from '../modules/stories';

function createMockStore(initialState) {
  let state = initialState || {};
  return {
    getState: jest.fn(() => state),
    setState: jest.fn((s) => {
      state = { ...state, ...s };
      return Promise.resolve(state);
    }),
  };
}

const provider = {
  getConfig() {
    return {};
  },
};

describe('stories API', () => {
  it('sets a sensible initialState', () => {
    const { state } = initStories({
      storyId: 'id',
      viewMode: 'story',
    });

    expect(state).toEqual({
      storiesConfigured: false,
      storiesHash: {},
      storyId: 'id',
      viewMode: 'story',
    });
  });
  const parameters = {};
  const storiesHash = {
    'a--1': { kind: 'a', name: '1', parameters, path: 'a--1', id: 'a--1', args: {} },
    'a--2': { kind: 'a', name: '2', parameters, path: 'a--2', id: 'a--2', args: {} },
    'b-c--1': {
      kind: 'b/c',
      name: '1',
      parameters,
      path: 'b-c--1',
      id: 'b-c--1',
      args: {},
    },
    'b-d--1': {
      kind: 'b/d',
      name: '1',
      parameters,
      path: 'b-d--1',
      id: 'b-d--1',
      args: {},
    },
    'b-d--2': {
      kind: 'b/d',
      name: '2',
      parameters,
      path: 'b-d--2',
      id: 'b-d--2',
      args: { a: 'b' },
    },
    'custom-id--1': {
      kind: 'b/e',
      name: '1',
      parameters,
      path: 'custom-id--1',
      id: 'custom-id--1',
      args: {},
    },
  };
  describe('setStories', () => {
    it('stores basic kinds and stories w/ correct keys', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setStories },
      } = initStories({ store, navigate, provider });

      setStories(storiesHash);

      const { storiesHash: storedStoriesHash } = store.getState();

      // We need exact key ordering, even if in theory JS doesn't guarantee it
      expect(Object.keys(storedStoriesHash)).toEqual([
        'a',
        'a--1',
        'a--2',
        'b',
        'b-c',
        'b-c--1',
        'b-d',
        'b-d--1',
        'b-d--2',
        'b-e',
        'custom-id--1',
      ]);
      expect(storedStoriesHash.a).toMatchObject({
        id: 'a',
        children: ['a--1', 'a--2'],
        isRoot: false,
        isComponent: true,
      });

      expect(storedStoriesHash['a--1']).toMatchObject({
        id: 'a--1',
        parent: 'a',
        kind: 'a',
        name: '1',
        parameters,
        args: {},
      });

      expect(storedStoriesHash['a--2']).toMatchObject({
        id: 'a--2',
        parent: 'a',
        kind: 'a',
        name: '2',
        parameters,
        args: {},
      });

      expect(storedStoriesHash.b).toMatchObject({
        id: 'b',
        children: ['b-c', 'b-d', 'b-e'],
        isRoot: false,
        isComponent: false,
      });

      expect(storedStoriesHash['b-c']).toMatchObject({
        id: 'b-c',
        parent: 'b',
        children: ['b-c--1'],
        isRoot: false,
        isComponent: true,
      });

      expect(storedStoriesHash['b-c--1']).toMatchObject({
        id: 'b-c--1',
        parent: 'b-c',
        kind: 'b/c',
        name: '1',
        parameters,
        args: {},
      });

      expect(storedStoriesHash['b-d']).toMatchObject({
        id: 'b-d',
        parent: 'b',
        children: ['b-d--1', 'b-d--2'],
        isRoot: false,
        isComponent: true,
      });

      expect(storedStoriesHash['b-d--1']).toMatchObject({
        id: 'b-d--1',
        parent: 'b-d',
        kind: 'b/d',
        name: '1',
        parameters,
        args: {},
      });

      expect(storedStoriesHash['b-d--2']).toMatchObject({
        id: 'b-d--2',
        parent: 'b-d',
        kind: 'b/d',
        name: '2',
        parameters,
        args: { a: 'b' },
      });

      expect(storedStoriesHash['b-e']).toMatchObject({
        id: 'b-e',
        parent: 'b',
        children: ['custom-id--1'],
        isRoot: false,
        isComponent: true,
      });

      expect(storedStoriesHash['custom-id--1']).toMatchObject({
        id: 'custom-id--1',
        parent: 'b-e',
        kind: 'b/e',
        name: '1',
        parameters,
        args: {},
      });
    });

    it('sets roots when showRoots = true', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setStories },
      } = initStories({ store, navigate, provider });

      const showRootsParameters = { options: { showRoots: true } };
      setStories({
        'a-b--1': {
          kind: 'a/b',
          name: '1',
          parameters: showRootsParameters,
          path: 'a-b--1',
          id: 'a-b--1',
          args: {},
        },
      });

      const { storiesHash: storedStoriesHash } = store.getState();

      // We need exact key ordering, even if in theory JS doens't guarantee it
      expect(Object.keys(storedStoriesHash)).toEqual(['a', 'a-b', 'a-b--1']);
      expect(storedStoriesHash.a).toMatchObject({
        id: 'a',
        children: ['a-b'],
        isRoot: true,
        isComponent: false,
      });
      expect(storedStoriesHash['a-b']).toMatchObject({
        id: 'a-b',
        parent: 'a',
        children: ['a-b--1'],
        isRoot: false,
        isComponent: true,
      });
      expect(storedStoriesHash['a-b--1']).toMatchObject({
        id: 'a-b--1',
        parent: 'a-b',
        kind: 'a/b',
        name: '1',
        parameters: showRootsParameters,
        args: {},
      });
    });

    it('does not put bare stories into a root when showRoots = true', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setStories },
      } = initStories({ store, navigate, provider });

      const showRootsParameters = { options: { showRoots: true } };
      setStories({
        'a--1': {
          kind: 'a',
          name: '1',
          parameters: showRootsParameters,
          path: 'a--1',
          id: 'a--1',
          args: {},
        },
      });

      const { storiesHash: storedStoriesHash } = store.getState();

      // We need exact key ordering, even if in theory JS doens't guarantee it
      expect(Object.keys(storedStoriesHash)).toEqual(['a', 'a--1']);
      expect(storedStoriesHash.a).toMatchObject({
        id: 'a',
        children: ['a--1'],
        isRoot: false,
        isComponent: true,
      });
      expect(storedStoriesHash['a--1']).toMatchObject({
        id: 'a--1',
        parent: 'a',
        kind: 'a',
        name: '1',
        parameters: showRootsParameters,
        args: {},
      });
    });

    it('handles roots also', async () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setStories },
      } = initStories({ store, navigate, provider });

      await setStories({
        'a--1': { kind: 'a', name: '1', parameters, path: 'a--1', id: 'a--1', args: {} },
        'a--2': { kind: 'a', name: '2', parameters, path: 'a--2', id: 'a--2', args: {} },
        'b-c--1': {
          kind: 'b|c',
          name: '1',
          parameters,
          path: 'b-c--1',
          id: 'b-c--1',
          args: {},
        },
        'b-d--1': {
          kind: 'b|d',
          name: '1',
          parameters,
          path: 'b-d--1',
          id: 'b-d--1',
          args: {},
        },
        'b-d--2': {
          kind: 'b|d',
          name: '2',
          parameters,
          path: 'b-d--2',
          id: 'b-d--2',
          args: {},
        },
      });
      const { storiesHash: storedStoriesHash } = store.getState();

      // We need exact key ordering, even if in theory JS doens't guarantee it
      expect(Object.keys(storedStoriesHash)).toEqual([
        'a',
        'a--1',
        'a--2',
        'b',
        'b-c',
        'b-c--1',
        'b-d',
        'b-d--1',
        'b-d--2',
      ]);
      expect(storedStoriesHash.b).toMatchObject({
        id: 'b',
        children: ['b-c', 'b-d'],
        isRoot: true,
        isComponent: false,
      });

      expect(storedStoriesHash['b-c']).toMatchObject({
        id: 'b-c',
        parent: 'b',
        children: ['b-c--1'],
        isRoot: false,
        isComponent: true,
      });

      expect(storedStoriesHash['b-c--1']).toMatchObject({
        id: 'b-c--1',
        parent: 'b-c',
        kind: 'b|c',
        name: '1',
        parameters,
        args: {},
      });

      expect(storedStoriesHash['b-d--1']).toMatchObject({
        id: 'b-d--1',
        parent: 'b-d',
        kind: 'b|d',
        name: '1',
        parameters,
        args: {},
      });

      expect(storedStoriesHash['b-d--2']).toMatchObject({
        id: 'b-d--2',
        parent: 'b-d',
        kind: 'b|d',
        name: '2',
        parameters,
        args: {},
      });
    });

    // Stories can get out of order for a few reasons -- see reproductions on
    //   https://github.com/storybookjs/storybook/issues/5518
    it('does the right thing for out of order stories', async () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setStories },
      } = initStories({ store, navigate, provider });

      await setStories({
        'a--1': { kind: 'a', name: '1', parameters, path: 'a--1', id: 'a--1', args: {} },
        'b--1': { kind: 'b', name: '1', parameters, path: 'b--1', id: 'b--1', args: {} },
        'a--2': { kind: 'a', name: '2', parameters, path: 'a--2', id: 'a--2', args: {} },
      });

      const { storiesHash: storedStoriesHash } = store.getState();

      // We need exact key ordering, even if in theory JS doens't guarantee it
      expect(Object.keys(storedStoriesHash)).toEqual(['a', 'a--1', 'a--2', 'b', 'b--1']);
      expect(storedStoriesHash.a).toMatchObject({
        id: 'a',
        children: ['a--1', 'a--2'],
        isRoot: false,
        isComponent: true,
      });

      expect(storedStoriesHash.b).toMatchObject({
        id: 'b',
        children: ['b--1'],
        isRoot: false,
        isComponent: true,
      });
    });

    it('navigates to the first story in the store if there is none selected', async () => {
      const navigate = jest.fn();
      const store = createMockStore({ viewMode: 'story' });

      const {
        api: { setStories },
      } = initStories({ store, navigate, provider });

      await setStories(storiesHash);
      expect(navigate).toHaveBeenCalledWith('/story/a--1');
    });

    it('navigates to the first story in the store if a non-existent story was selected', async () => {
      const navigate = jest.fn();
      const store = createMockStore({ viewMode: 'story', storyId: 'random' });

      const {
        api: { setStories },
      } = initStories({ store, navigate, provider });

      await setStories(storiesHash);
      expect(navigate).toHaveBeenCalledWith('/story/a--1');
    });

    it('navigates to the first leaf story if a story exists but it is not a leaf story(1)', async () => {
      const navigate = jest.fn();
      const store = createMockStore({ viewMode: 'story', storyId: 'b' });

      const {
        api: { setStories },
      } = initStories({ store, navigate, provider });

      await setStories(storiesHash);
      expect(navigate).toHaveBeenCalledWith('/story/b-c--1');
    });

    it('navigates to the first leaf story if a story exists but it is not a leaf story(2)', async () => {
      const navigate = jest.fn();
      const store = createMockStore({ viewMode: 'story', storyId: 'b-d' });

      const {
        api: { setStories },
      } = initStories({ store, navigate, provider });

      await setStories(storiesHash);
      expect(navigate).toHaveBeenCalledWith('/story/b-d--1');
    });

    it('does not navigate if a existing story was selected', async () => {
      const navigate = jest.fn();
      const store = createMockStore({ viewMode: 'story', storyId: 'b-c--1' });

      const {
        api: { setStories },
      } = initStories({ store, navigate, provider });

      await setStories(storiesHash);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('navigates to the settings page if a existing page was selected', async () => {
      const navigate = jest.fn();
      const store = createMockStore({ viewMode: 'settings', storyId: 'about' });

      const {
        api: { setStories },
      } = initStories({ store, navigate, provider });

      await setStories(storiesHash);
      expect(navigate).not.toHaveBeenCalled();
    });

    it(
      'navigates to the first story in the store when viewMode is settings but' +
        'non-existent page was selected',
      async () => {
        const navigate = jest.fn();
        const store = createMockStore({ viewMode: 'settings', storyId: 'random' });

        const {
          api: { setStories },
        } = initStories({ store, navigate, provider });

        await setStories(storiesHash);
        expect(navigate).not.toHaveBeenCalledWith();
      }
    );
  });

  describe('args handling', () => {
    it('changes args properly, per story when receiving STORY_ARGS_UPDATED', () => {
      const navigate = jest.fn();
      const store = createMockStore();
      const api = new EventEmitter();

      const {
        api: { setStories },
        init,
      } = initStories({ store, navigate, provider, fullAPI: api });

      setStories({
        'a--1': { kind: 'a', name: '1', parameters, path: 'a--1', id: 'a--1', args: { a: 'b' } },
        'b--1': { kind: 'b', name: '1', parameters, path: 'b--1', id: 'b--1', args: { x: 'y' } },
      });

      const { storiesHash: initialStoriesHash } = store.getState();
      expect(initialStoriesHash['a--1'].args).toEqual({ a: 'b' });
      expect(initialStoriesHash['b--1'].args).toEqual({ x: 'y' });

      init();
      api.emit(STORY_ARGS_UPDATED, 'a--1', { foo: 'bar' });

      const { storiesHash: changedStoriesHash } = store.getState();
      expect(changedStoriesHash['a--1'].args).toEqual({ foo: 'bar' });
      expect(changedStoriesHash['b--1'].args).toEqual({ x: 'y' });
    });

    it('updateStoryArgs emits UPDATE_STORY_ARGS and does not change anything', () => {
      const navigate = jest.fn();
      const emit = jest.fn();
      const on = jest.fn();
      const store = createMockStore();

      const {
        api: { setStories, updateStoryArgs },
        init,
      } = initStories({ store, navigate, provider, fullAPI: { emit, on } });

      setStories({
        'a--1': { kind: 'a', name: '1', parameters, path: 'a--1', id: 'a--1', args: { a: 'b' } },
        'b--1': { kind: 'b', name: '1', parameters, path: 'b--1', id: 'b--1', args: { x: 'y' } },
      });

      init();

      updateStoryArgs('a--1', { foo: 'bar' });
      expect(emit).toHaveBeenCalledWith(UPDATE_STORY_ARGS, 'a--1', { foo: 'bar' });

      const { storiesHash: changedStoriesHash } = store.getState();
      expect(changedStoriesHash['a--1'].args).toEqual({ a: 'b' });
      expect(changedStoriesHash['b--1'].args).toEqual({ x: 'y' });
    });
  });

  describe('jumpToStory', () => {
    it('works forward', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setStories, jumpToStory },
        state,
      } = initStories({ store, navigate, storyId: 'a--1', viewMode: 'story', provider });
      store.setState(state);
      setStories(storiesHash);

      jumpToStory(1);
      expect(navigate).toHaveBeenCalledWith('/story/a--2');
    });

    it('works backwards', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setStories, jumpToStory },
        state,
      } = initStories({ store, navigate, storyId: 'a--2', viewMode: 'story', provider });
      store.setState(state);
      setStories(storiesHash);

      jumpToStory(-1);
      expect(navigate).toHaveBeenCalledWith('/story/a--1');
    });

    it('does nothing if you are at the last story and go forward', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setStories, jumpToStory },
        state,
      } = initStories({ store, navigate, storyId: 'custom-id--1', viewMode: 'story', provider });
      store.setState(state);
      setStories(storiesHash);

      jumpToStory(1);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('does nothing if you are at the first story and go backward', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setStories, jumpToStory },
        state,
      } = initStories({ store, navigate, storyId: 'a--1', viewMode: 'story', provider });
      store.setState(state);
      setStories(storiesHash);

      jumpToStory(-1);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('does nothing if you have not selected a story', () => {
      const navigate = jest.fn();
      const store = { getState: () => ({ storiesHash }) };

      const {
        api: { jumpToStory },
      } = initStories({ store, navigate, provider });

      jumpToStory(1);
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe('jumpToComponent', () => {
    it('works forward', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setStories, jumpToComponent },
        state,
      } = initStories({ store, navigate, storyId: 'a--1', viewMode: 'story', provider });
      store.setState(state);
      setStories(storiesHash);

      jumpToComponent(1);
      expect(navigate).toHaveBeenCalledWith('/story/b-c--1');
    });

    it('works backwards', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setStories, jumpToComponent },
        state,
      } = initStories({ store, navigate, storyId: 'b-c--1', viewMode: 'story', provider });
      store.setState(state);
      setStories(storiesHash);

      jumpToComponent(-1);
      expect(navigate).toHaveBeenCalledWith('/story/a--1');
    });

    it('does nothing if you are in the last component and go forward', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setStories, jumpToComponent },
        state,
      } = initStories({ store, navigate, storyId: 'custom-id--1', viewMode: 'story', provider });
      store.setState(state);
      setStories(storiesHash);

      jumpToComponent(1);
      expect(navigate).not.toHaveBeenCalled();
    });

    it('does nothing if you are at the first component and go backward', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { setStories, jumpToComponent },
        state,
      } = initStories({ store, navigate, storyId: 'a--2', viewMode: 'story', provider });
      store.setState(state);
      setStories(storiesHash);

      jumpToComponent(-1);
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe('selectStory', () => {
    it('navigates', () => {
      const navigate = jest.fn();
      const store = {
        getState: () => ({ viewMode: 'story', storiesHash }),
      };

      const {
        api: { selectStory },
      } = initStories({ store, navigate, provider });

      selectStory('a--2');
      expect(navigate).toHaveBeenCalledWith('/story/a--2');
    });

    it('allows navigating to kind/storyname (legacy api)', () => {
      const navigate = jest.fn();
      const store = {
        getState: () => ({ viewMode: 'story', storiesHash }),
      };

      const {
        api: { selectStory },
      } = initStories({ store, navigate, provider });

      selectStory('a', '2');
      expect(navigate).toHaveBeenCalledWith('/story/a--2');
    });

    it('allows navigating to storyname, without kind (legacy api)', () => {
      const navigate = jest.fn();
      const store = {
        getState: () => ({ viewMode: 'story', storyId: 'a--1', storiesHash }),
      };

      const {
        api: { selectStory },
      } = initStories({ store, navigate, provider });

      selectStory(null, '2');
      expect(navigate).toHaveBeenCalledWith('/story/a--2');
    });

    it('allows navigating to first story in kind on call by kind', () => {
      const navigate = jest.fn();
      const store = createMockStore();

      const {
        api: { selectStory, setStories },
        state,
      } = initStories({ store, navigate, provider });
      store.setState(state);
      setStories(storiesHash);

      selectStory('a');
      expect(navigate).toHaveBeenCalledWith('/story/a--1');
    });

    describe('compnonent permalinks', () => {
      it('allows navigating to kind/storyname (legacy api)', () => {
        const navigate = jest.fn();
        const store = createMockStore();

        const {
          api: { selectStory, setStories },
          state,
        } = initStories({ store, navigate, provider });
        store.setState(state);
        setStories(storiesHash);

        selectStory('b/e', '1');
        expect(navigate).toHaveBeenCalledWith('/story/custom-id--1');
      });

      it('allows navigating to component permalink/storyname (legacy api)', () => {
        const navigate = jest.fn();
        const store = createMockStore();

        const {
          api: { selectStory, setStories },
          state,
        } = initStories({ store, navigate, provider });
        store.setState(state);
        setStories(storiesHash);

        selectStory('custom-id', '1');
        expect(navigate).toHaveBeenCalledWith('/story/custom-id--1');
      });

      it('allows navigating to first story in kind on call by kind', () => {
        const navigate = jest.fn();
        const store = createMockStore();

        const {
          api: { selectStory, setStories },
          state,
        } = initStories({ store, navigate, provider });
        store.setState(state);
        setStories(storiesHash);

        selectStory('b/e');
        expect(navigate).toHaveBeenCalledWith('/story/custom-id--1');
      });
    });
  });
  describe('v2 SET_STORIES event', () => {
    it('normalizes parameters and calls setStories for local stories', () => {
      const fullAPI = { on: jest.fn(), setStories: jest.fn(), setOptions: jest.fn() };
      const navigate = jest.fn();
      const store = createMockStore();

      const { init } = initStories({ store, navigate, provider, fullAPI });
      init();

      const onSetStories = fullAPI.on.mock.calls.find(([event]) => event === SET_STORIES)[1];

      const setStoriesPayload = {
        v: 2,
        globalParameters: { global: 'global' },
        kindParameters: { a: { kind: 'kind' } },
        stories: { 'a--1': { kind: 'a', parameters: { story: 'story' } } },
      };
      onSetStories.call({ source: 'http://localhost' }, setStoriesPayload);

      expect(fullAPI.setStories).toHaveBeenCalledWith(
        {
          'a--1': { kind: 'a', parameters: { global: 'global', kind: 'kind', story: 'story' } },
        },
        undefined
      );
    });

    it('normalizes parameters and calls setRef for external stories', () => {
      const fullAPI = {
        on: jest.fn(),
        findRef: jest.fn().mockReturnValue({ id: 'ref' }),
        setRef: jest.fn(),
      };
      const navigate = jest.fn();
      const store = createMockStore();

      const { init } = initStories({ store, navigate, provider, fullAPI });
      init();

      const onSetStories = fullAPI.on.mock.calls.find(([event]) => event === SET_STORIES)[1];

      const setStoriesPayload = {
        v: 2,
        globalParameters: { global: 'global' },
        kindParameters: { a: { kind: 'kind' } },
        stories: { 'a--1': { kind: 'a', parameters: { story: 'story' } } },
      };
      onSetStories.call({ source: 'http://external' }, setStoriesPayload);

      expect(fullAPI.setRef).toHaveBeenCalledWith(
        'ref',
        {
          id: 'ref',
          v: 2,
          globalParameters: { global: 'global' },
          kindParameters: { a: { kind: 'kind' } },
          stories: {
            'a--1': { kind: 'a', parameters: { global: 'global', kind: 'kind', story: 'story' } },
          },
        },
        true
      );
    });

    it('calls setOptions with global options parameters', () => {
      const fullAPI = { on: jest.fn(), setStories: jest.fn(), setOptions: jest.fn() };
      const navigate = jest.fn();
      const store = createMockStore();

      const { init } = initStories({ store, navigate, provider, fullAPI });
      init();

      const onSetStories = fullAPI.on.mock.calls.find(([event]) => event === SET_STORIES)[1];

      const setStoriesPayload = {
        v: 2,
        globalParameters: { options: 'options' },
        kindParameters: { a: { options: 'should-be-ignored' } },
        stories: { 'a--1': { kind: 'a', parameters: { options: 'should-be-ignored-also' } } },
      };
      onSetStories.call({ source: 'http://localhost' }, setStoriesPayload);

      expect(fullAPI.setOptions).toHaveBeenCalledWith('options');
    });
  });
  describe('legacy (v1) SET_STORIES event', () => {
    it('calls setRef with stories', () => {
      const fullAPI = {
        on: jest.fn(),
        findRef: jest.fn().mockReturnValue({ id: 'ref' }),
        setRef: jest.fn(),
      };
      const navigate = jest.fn();
      const store = createMockStore();

      const { init } = initStories({ store, navigate, provider, fullAPI });
      init();

      const onSetStories = fullAPI.on.mock.calls.find(([event]) => event === SET_STORIES)[1];

      const setStoriesPayload = {
        stories: { 'a--1': {} },
      };
      onSetStories.call({ source: 'http://external' }, setStoriesPayload);

      expect(fullAPI.setRef).toHaveBeenCalledWith(
        'ref',
        {
          id: 'ref',
          stories: {
            'a--1': {},
          },
        },
        true
      );
    });
  });
});
