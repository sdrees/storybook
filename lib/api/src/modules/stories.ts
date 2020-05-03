/* eslint-disable no-fallthrough */
import { DOCS_MODE } from 'global';
import { toId, sanitize } from '@storybook/csf';
import {
  UPDATE_STORY_ARGS,
  STORY_ARGS_UPDATED,
  STORY_CHANGED,
  SELECT_STORY,
  SET_STORIES,
} from '@storybook/core-events';

import { logger } from '@storybook/client-logger';
import {
  denormalizeStoryParameters,
  transformStoriesRawToStoriesHash,
  StoriesHash,
  Story,
  Group,
  SetStoriesPayload,
  StoryId,
  isStory,
  Root,
  isRoot,
  StoriesRaw,
  SetStoriesPayloadV2,
} from '../lib/stories';

import { Args, ModuleFn } from '../index';
import { getSourceType } from './refs';

type Direction = -1 | 1;
type ParameterName = string;

type ViewMode = 'story' | 'info' | 'settings' | string | undefined;

export interface SubState {
  storiesHash: StoriesHash;
  storyId: StoryId;
  viewMode: ViewMode;
  storiesConfigured: boolean;
}

export interface SubAPI {
  storyId: typeof toId;
  resolveStory: (storyId: StoryId, refsId?: string) => Story | Group | Root;
  selectStory: (
    kindOrId: string,
    story?: string,
    obj?: { ref?: string; viewMode?: ViewMode }
  ) => void;
  getCurrentStoryData: () => Story | Group;
  setStories: (stories: StoriesRaw) => Promise<void>;
  jumpToComponent: (direction: Direction) => void;
  jumpToStory: (direction: Direction) => void;
  getData: (storyId: StoryId, refId?: string) => Story | Group;
  getParameters: (
    storyId: StoryId | { storyId: StoryId; refId: string },
    parameterName?: ParameterName
  ) => Story['parameters'] | any;
  getCurrentParameter<S>(parameterName?: ParameterName): S;
  updateStoryArgs(id: StoryId, newArgs: Args): void;
  findLeafStoryId(StoriesHash: StoriesHash, storyId: StoryId): StoryId;
}

export const init: ModuleFn = ({
  fullAPI,
  store,
  navigate,
  provider,
  storyId: initialStoryId,
  viewMode: initialViewMode,
}) => {
  const setInitialStory = () => {
    const { storyId, viewMode, storiesHash } = store.getState();
    const story = api.getData(storyId);

    if (viewMode === 'settings' || viewMode === 'page') {
      return;
    }

    if (storyId && storyId.match(/--\*$/)) {
      const idStart = storyId.slice(0, -1); // drop the * at the end
      const firstKindLeaf = Object.values(storiesHash).find(
        (s: Story | Group) => !s.children && s.id.substring(0, idStart.length) === idStart
      );

      if (viewMode && firstKindLeaf) {
        api.selectStory(firstKindLeaf.id, undefined, {});
      }
    } else if (!storyId || storyId === '*' || !story) {
      // when there's no storyId or the storyId item doesn't exist
      // we pick the first leaf and navigate
      const firstLeaf = Object.values(storiesHash).find((s: Story | Group) => !s.children);

      if (viewMode && firstLeaf) {
        api.selectStory(firstLeaf.id, undefined, {});
      }
    } else if (story && !story.isLeaf) {
      // When story exists but if it is not the leaf story, it finds the proper
      // leaf story from any depth.
      const firstLeafStoryId = api.findLeafStoryId(storiesHash, storyId);

      api.selectStory(firstLeafStoryId, undefined, {});
    }
  };

  const api: SubAPI = {
    storyId: toId,
    getData: (storyId, refId) => {
      const result = api.resolveStory(storyId, refId);

      return isRoot(result) ? undefined : result;
    },
    resolveStory: (storyId, refId) => {
      const { refs, storiesHash } = store.getState();
      if (refId) {
        return refs[refId].stories ? refs[refId].stories[storyId] : undefined;
      }
      return storiesHash ? storiesHash[storyId] : undefined;
    },
    getCurrentStoryData: () => {
      const { storyId, refId } = store.getState();

      return api.getData(storyId, refId);
    },
    getParameters: (storyIdOrCombo, parameterName) => {
      const { storyId, refId } =
        typeof storyIdOrCombo === 'string'
          ? { storyId: storyIdOrCombo, refId: undefined }
          : storyIdOrCombo;
      const data = api.getData(storyId, refId);

      if (isStory(data)) {
        const { parameters } = data;
        return parameterName ? parameters[parameterName] : parameters;
      }

      return null;
    },
    getCurrentParameter: (parameterName) => {
      const { storyId, refId } = store.getState();
      const parameters = api.getParameters({ storyId, refId }, parameterName);

      if (parameters) {
        return parameters;
      }
      return undefined;
    },
    jumpToComponent: (direction) => {
      const { storiesHash, storyId, refs, refId } = store.getState();
      const story = api.getData(storyId, refId);

      // cannot navigate when there's no current selection
      if (!story) {
        return;
      }

      const hash = refId ? refs[refId].stories || {} : storiesHash;

      const lookupList = Object.entries(hash).reduce((acc, i) => {
        const value = i[1];
        if (value.isComponent) {
          acc.push([...i[1].children]);
        }
        return acc;
      }, []);

      const index = lookupList.findIndex((i) => i.includes(storyId));

      // cannot navigate beyond fist or last
      if (index === lookupList.length - 1 && direction > 0) {
        return;
      }
      if (index === 0 && direction < 0) {
        return;
      }

      const result = lookupList[index + direction][0];

      if (result) {
        api.selectStory(result, undefined, { ref: refId });
      }
    },
    jumpToStory: (direction) => {
      const { storiesHash, storyId, refs, refId } = store.getState();
      const story = api.getData(storyId, refId);

      if (DOCS_MODE) {
        api.jumpToComponent(direction);
        return;
      }

      // cannot navigate when there's no current selection
      if (!story) {
        return;
      }

      const hash = story.refId ? refs[story.refId].stories : storiesHash;

      const lookupList = Object.keys(hash).filter(
        (k) => !(hash[k].children || Array.isArray(hash[k]))
      );
      const index = lookupList.indexOf(storyId);

      // cannot navigate beyond fist or last
      if (index === lookupList.length - 1 && direction > 0) {
        return;
      }
      if (index === 0 && direction < 0) {
        return;
      }

      const result = lookupList[index + direction];

      if (result) {
        api.selectStory(result, undefined, { ref: refId });
      }
    },
    setStories: async (input) => {
      // Now create storiesHash by reordering the above by group
      const existing = store.getState().storiesHash;
      const hash = transformStoriesRawToStoriesHash(input, existing, {
        provider,
      });

      await store.setState({
        storiesHash: hash,
        storiesConfigured: true,
      });

      const { refId } = store.getState();

      if (!refId) {
        setInitialStory();
      }
    },
    selectStory: (kindOrId, story = undefined, options = {}) => {
      const { ref, viewMode: viewModeFromArgs } = options;
      const {
        viewMode: viewModeFromState = 'story',
        storyId,
        storiesHash,
        refs,
      } = store.getState();

      const hash = ref ? refs[ref].stories : storiesHash;

      if (!story) {
        const s = hash[kindOrId] || hash[sanitize(kindOrId)];
        // eslint-disable-next-line no-nested-ternary
        const id = s ? (s.children ? s.children[0] : s.id) : kindOrId;
        const viewMode =
          viewModeFromArgs || (s && s.parameters.viewMode)
            ? s.parameters.viewMode
            : viewModeFromState;
        const p = s && s.refId ? `/${viewMode}/${s.refId}_${id}` : `/${viewMode}/${id}`;

        navigate(p);
      } else if (!kindOrId) {
        // This is a slugified version of the kind, but that's OK, our toId function is idempotent
        const kind = storyId.split('--', 2)[0];
        const id = toId(kind, story);

        api.selectStory(id, undefined, options);
      } else {
        const id = ref ? `${ref}_${toId(kindOrId, story)}` : toId(kindOrId, story);
        if (hash[id]) {
          api.selectStory(id, undefined, options);
        } else {
          // Support legacy API with component permalinks, where kind is `x/y` but permalink is 'z'
          const k = hash[sanitize(kindOrId)];
          if (k && k.children) {
            const foundId = k.children.find((childId) => hash[childId].name === story);
            if (foundId) {
              api.selectStory(foundId, undefined, options);
            }
          }
        }
      }
    },
    findLeafStoryId(storiesHash, storyId) {
      if (storiesHash[storyId].isLeaf) {
        return storyId;
      }

      const childStoryId = storiesHash[storyId].children[0];
      return api.findLeafStoryId(storiesHash, childStoryId);
    },
    updateStoryArgs: (id, newArgs) => {
      fullAPI.emit(UPDATE_STORY_ARGS, id, newArgs);
    },
  };

  const initModule = () => {
    fullAPI.on(STORY_CHANGED, function handleStoryChange(storyId: string) {
      const { source }: { source: string } = this;
      const [sourceType] = getSourceType(source);

      if (sourceType === 'local') {
        const options = fullAPI.getCurrentParameter('options');

        if (options) {
          fullAPI.setOptions(options);
        }
      }
    });

    fullAPI.on(SET_STORIES, function handleSetStories(data: SetStoriesPayload) {
      // the event originates from an iframe, event.source is the iframe's location origin + pathname
      const { source }: { source: string } = this;
      const [sourceType, sourceLocation] = getSourceType(source);

      // TODO: what is the mechanism where we warn here?
      if (data.v && data.v > 2)
        // eslint-disable-next-line no-console
        console.warn(`Received SET_STORIES event with version ${data.v}, we'll try and handle it`);

      const stories = data.v
        ? denormalizeStoryParameters(data as SetStoriesPayloadV2)
        : data.stories;

      switch (sourceType) {
        // if it's a local source, we do nothing special
        case 'local': {
          if (!data.v) throw new Error('Unexpected legacy SET_STORIES event from local source');

          fullAPI.setStories(stories);

          fullAPI.setOptions((data as SetStoriesPayloadV2).globalParameters.options);
          break;
        }

        // if it's a ref, we need to map the incoming stories to a prefixed version, so it cannot conflict with others
        case 'external': {
          const ref = fullAPI.findRef(sourceLocation);
          if (ref) {
            fullAPI.setRef(ref.id, { ...ref, ...data, stories }, true);
            break;
          }
        }

        // if we couldn't find the source, something risky happened, we ignore the input, and log a warning
        default: {
          logger.warn('received a SET_STORIES frame that was not configured as a ref');
          break;
        }
      }
    });

    fullAPI.on(SELECT_STORY, function selectStoryHandler({
      kind,
      story,
      ...rest
    }: {
      kind: string;
      story: string;
      [k: string]: any;
    }) {
      const { source }: { source: string } = this;
      const [sourceType, sourceLocation] = getSourceType(source);

      switch (sourceType) {
        case 'local': {
          fullAPI.selectStory(kind, story, rest);
          break;
        }

        case 'external': {
          const ref = fullAPI.findRef(sourceLocation);
          fullAPI.selectStory(kind, story, { ...rest, ref: ref.id });
          break;
        }
        default: {
          logger.warn('received a SET_STORIES frame that was not configured as a ref');
          break;
        }
      }
    });

    fullAPI.on(STORY_ARGS_UPDATED, (id: StoryId, args: Args) => {
      const { storiesHash } = store.getState();
      (storiesHash[id] as Story).args = args;
      store.setState({ storiesHash });
    });
  };

  return {
    api,
    state: {
      storiesHash: {},
      storyId: initialStoryId,
      viewMode: initialViewMode,
      storiesConfigured: false,
    },
    init: initModule,
  };
};
