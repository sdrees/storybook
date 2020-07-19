import { location, fetch } from 'global';
import dedent from 'ts-dedent';
import {
  transformStoriesRawToStoriesHash,
  StoriesRaw,
  StoryInput,
  StoriesHash,
} from '../lib/stories';

import { ModuleFn } from '../index';

export interface SubState {
  refs: Refs;
}

type Versions = Record<string, string>;

export type SetRefData = Partial<
  Omit<ComposedRef, 'stories'> & {
    stories?: StoriesRaw;
  }
>;

export interface SubAPI {
  findRef: (source: string) => ComposedRef;
  setRef: (id: string, data: SetRefData, ready?: boolean) => void;
  updateRef: (id: string, ref: ComposedRefUpdate) => void;
  getRefs: () => Refs;
  checkRef: (ref: SetRefData) => Promise<void>;
  changeRefVersion: (id: string, url: string) => void;
  changeRefState: (id: string, ready: boolean) => void;
}

export type StoryMapper = (ref: ComposedRef, story: StoryInput) => StoryInput;
export interface ComposedRef {
  id: string;
  title?: string;
  url: string;
  type?: 'auto-inject' | 'unknown' | 'lazy';
  stories: StoriesHash;
  versions?: Versions;
  loginUrl?: string;
  version?: string;
  ready?: boolean;
  error?: any;
}
export interface ComposedRefUpdate {
  title?: string;
  type?: 'auto-inject' | 'unknown' | 'lazy';
  stories?: StoriesHash;
  versions?: Versions;
  loginUrl?: string;
  version?: string;
  ready?: boolean;
  error?: any;
}

export type Refs = Record<string, ComposedRef>;
export type RefId = string;
export type RefUrl = string;

// eslint-disable-next-line no-useless-escape
const findFilename = /(\/((?:[^\/]+?)\.[^\/]+?)|\/)$/;

const allSettled = (promises: Promise<Response>[]): Promise<(Response | false)[]> =>
  Promise.all(
    promises.map((promise) =>
      promise.then(
        (r) => (r.ok ? r : (false as const)),
        () => false as const
      )
    )
  );

export const getSourceType = (source: string, refId: string) => {
  const { origin: localOrigin, pathname: localPathname } = location;
  const { origin: sourceOrigin, pathname: sourcePathname } = new URL(source);

  const localFull = `${localOrigin + localPathname}`.replace(findFilename, '');
  const sourceFull = `${sourceOrigin + sourcePathname}`.replace(findFilename, '');

  if (localFull === sourceFull) {
    return ['local', sourceFull];
  }
  if (refId || source) {
    return ['external', sourceFull];
  }
  return [null, null];
};

export const defaultStoryMapper: StoryMapper = (b, a) => {
  return { ...a, kind: a.kind.replace('|', '/') };
};

const addRefIds = (input: StoriesHash, ref: ComposedRef): StoriesHash => {
  return Object.entries(input).reduce((acc, [id, item]) => {
    return { ...acc, [id]: { ...item, refId: ref.id } };
  }, {} as StoriesHash);
};

const map = (
  input: StoriesRaw,
  ref: ComposedRef,
  options: { storyMapper?: StoryMapper }
): StoriesRaw => {
  const { storyMapper } = options;
  if (storyMapper) {
    return Object.entries(input).reduce((acc, [id, item]) => {
      return { ...acc, [id]: storyMapper(ref, item) };
    }, {} as StoriesRaw);
  }
  return input;
};

export const init: ModuleFn = ({ store, provider, fullAPI }, { runCheck = true } = {}) => {
  const api: SubAPI = {
    findRef: (source) => {
      const refs = api.getRefs();

      return Object.values(refs).find(({ url }) => url.match(source));
    },
    changeRefVersion: (id, url) => {
      const { versions, title } = api.getRefs()[id];
      const ref = { id, url, versions, title, stories: {} } as SetRefData;

      api.checkRef(ref);
    },
    changeRefState: (id, ready) => {
      const { [id]: ref, ...updated } = api.getRefs();

      updated[id] = { ...ref, ready };

      store.setState({
        refs: updated,
      });
    },
    checkRef: async (ref) => {
      const { id, url, version } = ref;

      const loadedData: { error?: Error; stories?: StoriesRaw; loginUrl?: string } = {};
      const query = version ? `?version=${version}` : '';

      const [included, omitted, iframe] = await allSettled([
        fetch(`${url}/stories.json${query}`, {
          headers: {
            Accept: 'application/json',
          },
          credentials: 'include',
        }),
        fetch(`${url}/stories.json${query}`, {
          headers: {
            Accept: 'application/json',
          },
          credentials: 'omit',
        }),
        fetch(`${url}/iframe.html${query}`, {
          mode: 'no-cors',
          credentials: 'omit',
        }),
      ]);

      const handle = async (request: Response | false): Promise<SetRefData> => {
        if (request) {
          return Promise.resolve(request)
            .then((response) => (response.ok ? response.json() : {}))
            .catch((error) => ({ error }));
        }
        return {};
      };

      if (!included && !omitted && !iframe) {
        loadedData.error = {
          message: dedent`
            Error: Loading of ref failed
              at fetch (lib/api/src/modules/refs.ts)
            
            URL: ${url}
            
            We weren't able to load the above URL,
            it's possible a CORS error happened.
            
            Please check your dev-tools network tab.
          `,
        } as Error;
      } else if (omitted || included) {
        const credentials = included ? 'include' : 'omit';

        const [stories, metadata] = await Promise.all([
          included ? handle(included) : handle(omitted),
          handle(
            fetch(`${url}/metadata.json${query}`, {
              headers: {
                Accept: 'application/json',
              },
              credentials,
              cache: 'no-cache',
            }).catch(() => false)
          ),
        ]);

        Object.assign(loadedData, { ...stories, ...metadata });
      }

      await api.setRef(id, {
        id,
        url,
        ...loadedData,
        error: loadedData.error,
        type: !loadedData.stories ? 'auto-inject' : 'lazy',
      });
    },

    getRefs: () => {
      const { refs = {} } = store.getState();

      return refs;
    },

    setRef: (id, { stories, ...rest }, ready = false) => {
      const { storyMapper = defaultStoryMapper } = provider.getConfig();
      const ref = api.getRefs()[id];
      const after = stories
        ? addRefIds(
            transformStoriesRawToStoriesHash(map(stories, ref, { storyMapper }), { provider }),
            ref
          )
        : undefined;

      api.updateRef(id, { stories: after, ...rest, ready });
    },

    updateRef: (id, data) => {
      const { [id]: ref, ...updated } = api.getRefs();

      updated[id] = { ...ref, ...data };

      store.setState({
        refs: updated,
      });
    },
  };

  const refs = provider.getConfig().refs || {};

  const initialState: SubState['refs'] = refs;

  Object.values(refs).forEach((r) => {
    // eslint-disable-next-line no-param-reassign
    r.type = 'unknown';
  });

  if (runCheck) {
    Object.entries(refs).forEach(([k, v]) => {
      api.checkRef(v as SetRefData);
    });
  }

  return {
    api,
    state: {
      refs: initialState,
    },
  };
};
