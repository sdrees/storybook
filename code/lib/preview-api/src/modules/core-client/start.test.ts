/* eslint-disable no-underscore-dangle */
/**
 * @jest-environment jsdom
 */

// import { describe, it, beforeAll, beforeEach, afterAll, afterEach, jest } from '@jest/globals';
import { STORY_RENDERED, STORY_UNCHANGED, SET_INDEX, CONFIG_ERROR } from '@storybook/core-events';

import type { ModuleExports, Path } from '@storybook/types';
import { global } from '@storybook/global';
import { setGlobalRender } from '../../client-api';
import {
  waitForRender,
  waitForEvents,
  waitForQuiescence,
  emitter,
  mockChannel,
} from '../preview-web/PreviewWeb.mockdata';

import { start as realStart } from './start';
import type { Loadable } from './executeLoadable';

jest.mock('@storybook/global', () => ({
  global: {
    ...globalThis,
    window: globalThis,
    history: { replaceState: jest.fn() },
    document: {
      location: {
        pathname: 'pathname',
        search: '?id=*',
      },
    },
    DOCS_OPTIONS: {},
  },
}));

// console.log(global);

jest.mock('@storybook/channels', () => ({
  createBrowserChannel: () => mockChannel,
}));
jest.mock('@storybook/client-logger');
jest.mock('react-dom');

// for the auto-title test
jest.mock('../../store', () => {
  const actualStore = jest.requireActual('../../store');
  return {
    ...actualStore,
    userOrAutoTitle: (importPath: Path, specifier: any, userTitle?: string) =>
      userTitle || 'auto-title',
  };
});

jest.mock('../../preview-web', () => {
  const actualPreviewWeb = jest.requireActual('../../preview-web');

  class OverloadPreviewWeb extends actualPreviewWeb.PreviewWeb {
    constructor() {
      super();

      this.view = {
        ...Object.fromEntries(
          Object.getOwnPropertyNames(this.view.constructor.prototype).map((key) => [key, jest.fn()])
        ),
        prepareForDocs: jest.fn().mockReturnValue('docs-root'),
        prepareForStory: jest.fn().mockReturnValue('story-root'),
      };
    }
  }
  return {
    ...actualPreviewWeb,
    PreviewWeb: OverloadPreviewWeb,
  };
});

beforeEach(() => {
  mockChannel.emit.mockClear();
  // Preview doesn't clean itself up as it isn't designed to ever be stopped :shrug:
  emitter.removeAllListeners();
});

const start: typeof realStart = (...args) => {
  const result = realStart(...args);

  const configure: typeof result['configure'] = (
    framework: string,
    loadable: Loadable,
    m?: NodeModule,
    disableBackwardCompatibility = false
  ) => result.configure(framework, loadable, m, disableBackwardCompatibility);

  return {
    ...result,
    configure,
  };
};
afterEach(() => {
  // I'm not sure why this is required (it seems just afterEach is required really)
  mockChannel.emit.mockClear();
});

function makeRequireContext(importMap: Record<Path, ModuleExports>) {
  const req = (path: Path) => importMap[path];
  req.keys = () => Object.keys(importMap);
  return req;
}

describe('start', () => {
  beforeEach(() => {
    global.DOCS_OPTIONS = {};
    // @ts-expect-error (setting this to undefined is indeed what we want to do)
    global.__STORYBOOK_CLIENT_API__ = undefined;
    // @ts-expect-error (setting this to undefined is indeed what we want to do)
    global.__STORYBOOK_PREVIEW__ = undefined;
    // @ts-expect-error (setting this to undefined is indeed what we want to do)
    global.IS_STORYBOOK = undefined;
  });

  const componentCExports = {
    default: {
      title: 'Component C',
      tags: ['component-tag', 'autodocs'],
    },
    StoryOne: {
      render: jest.fn(),
      tags: ['story-tag'],
    },
    StoryTwo: jest.fn(),
  };

  describe('when configure is called with CSF only', () => {
    it('loads and renders the first story correctly', async () => {
      const renderToCanvas = jest.fn();

      const { configure } = start(renderToCanvas);
      configure('test', () => [componentCExports]);

      await waitForRender();
      expect(mockChannel.emit.mock.calls.find((call) => call[0] === SET_INDEX)?.[1])
        .toMatchInlineSnapshot(`
        Object {
          "entries": Object {
            "component-c--story-one": Object {
              "argTypes": Object {},
              "args": Object {},
              "id": "component-c--story-one",
              "importPath": "exports-map-0",
              "initialArgs": Object {},
              "name": "Story One",
              "parameters": Object {
                "__isArgsStory": false,
                "fileName": "exports-map-0",
                "renderer": "test",
              },
              "tags": Array [
                "story-tag",
                "story",
              ],
              "title": "Component C",
              "type": "story",
            },
            "component-c--story-two": Object {
              "argTypes": Object {},
              "args": Object {},
              "id": "component-c--story-two",
              "importPath": "exports-map-0",
              "initialArgs": Object {},
              "name": "Story Two",
              "parameters": Object {
                "__isArgsStory": false,
                "fileName": "exports-map-0",
                "renderer": "test",
              },
              "tags": Array [
                "component-tag",
                "autodocs",
                "story",
              ],
              "title": "Component C",
              "type": "story",
            },
          },
          "v": 4,
        }
      `);

      await waitForRender();
      expect(mockChannel.emit).toHaveBeenCalledWith(STORY_RENDERED, 'component-c--story-one');

      expect(renderToCanvas).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'component-c--story-one',
        }),
        'story-root'
      );
    });

    it('supports HMR when a story file changes', async () => {
      const renderToCanvas = jest.fn(({ storyFn }) => storyFn());

      let disposeCallback: (data: object) => void = () => {};
      const module = {
        id: 'file1',
        hot: {
          data: {},
          accept: jest.fn(),
          dispose(cb: () => void) {
            disposeCallback = cb;
          },
        },
      };

      const { configure } = start(renderToCanvas);
      configure('test', () => [componentCExports], module as any);

      await waitForRender();
      expect(mockChannel.emit).toHaveBeenCalledWith(STORY_RENDERED, 'component-c--story-one');
      expect(componentCExports.StoryOne.render).toHaveBeenCalled();
      expect(module.hot.accept).toHaveBeenCalled();
      expect(disposeCallback).toBeDefined();

      mockChannel.emit.mockClear();
      disposeCallback(module.hot.data);
      const secondImplementation = jest.fn();
      configure(
        'test',
        () => [{ ...componentCExports, StoryOne: secondImplementation }],
        module as any
      );

      await waitForRender();
      expect(mockChannel.emit).toHaveBeenCalledWith(STORY_RENDERED, 'component-c--story-one');
      expect(secondImplementation).toHaveBeenCalled();
    });

    it('re-emits SET_INDEX when a story is added', async () => {
      const renderToCanvas = jest.fn(({ storyFn }) => storyFn());

      let disposeCallback: (data: object) => void = () => {};
      const module = {
        id: 'file1',
        hot: {
          data: {},
          accept: jest.fn(),
          dispose(cb: () => void) {
            disposeCallback = cb;
          },
        },
      };
      const { configure } = start(renderToCanvas);
      configure('test', () => [componentCExports], module as any);

      await waitForRender();

      mockChannel.emit.mockClear();
      disposeCallback(module.hot.data);
      configure('test', () => [{ ...componentCExports, StoryThree: jest.fn() }], module as any);

      await waitForEvents([SET_INDEX]);
      expect(mockChannel.emit.mock.calls.find((call) => call[0] === SET_INDEX)?.[1])
        .toMatchInlineSnapshot(`
        Object {
          "entries": Object {
            "component-c--story-one": Object {
              "argTypes": Object {},
              "args": Object {},
              "id": "component-c--story-one",
              "importPath": "exports-map-0",
              "initialArgs": Object {},
              "name": "Story One",
              "parameters": Object {
                "__isArgsStory": false,
                "fileName": "exports-map-0",
                "renderer": "test",
              },
              "tags": Array [
                "story-tag",
                "story",
              ],
              "title": "Component C",
              "type": "story",
            },
            "component-c--story-three": Object {
              "argTypes": Object {},
              "args": Object {},
              "id": "component-c--story-three",
              "importPath": "exports-map-0",
              "initialArgs": Object {},
              "name": "Story Three",
              "parameters": Object {
                "__isArgsStory": false,
                "fileName": "exports-map-0",
                "renderer": "test",
              },
              "tags": Array [
                "component-tag",
                "autodocs",
                "story",
              ],
              "title": "Component C",
              "type": "story",
            },
            "component-c--story-two": Object {
              "argTypes": Object {},
              "args": Object {},
              "id": "component-c--story-two",
              "importPath": "exports-map-0",
              "initialArgs": Object {},
              "name": "Story Two",
              "parameters": Object {
                "__isArgsStory": false,
                "fileName": "exports-map-0",
                "renderer": "test",
              },
              "tags": Array [
                "component-tag",
                "autodocs",
                "story",
              ],
              "title": "Component C",
              "type": "story",
            },
          },
          "v": 4,
        }
      `);
    });

    it('re-emits SET_INDEX when a story file is removed', async () => {
      const renderToCanvas = jest.fn(({ storyFn }) => storyFn());

      let disposeCallback: (data: object) => void = () => {};
      const module = {
        id: 'file1',
        hot: {
          data: {},
          accept: jest.fn(),
          dispose(cb: () => void) {
            disposeCallback = cb;
          },
        },
      };
      const { configure } = start(renderToCanvas);
      configure(
        'test',
        () => [componentCExports, { default: { title: 'Component D' }, StoryFour: jest.fn() }],
        module as any
      );

      await waitForEvents([SET_INDEX]);
      expect(mockChannel.emit.mock.calls.find((call) => call[0] === SET_INDEX)?.[1])
        .toMatchInlineSnapshot(`
        Object {
          "entries": Object {
            "component-c--story-one": Object {
              "argTypes": Object {},
              "args": Object {},
              "id": "component-c--story-one",
              "importPath": "exports-map-0",
              "initialArgs": Object {},
              "name": "Story One",
              "parameters": Object {
                "__isArgsStory": false,
                "fileName": "exports-map-0",
                "renderer": "test",
              },
              "tags": Array [
                "story-tag",
                "story",
              ],
              "title": "Component C",
              "type": "story",
            },
            "component-c--story-two": Object {
              "argTypes": Object {},
              "args": Object {},
              "id": "component-c--story-two",
              "importPath": "exports-map-0",
              "initialArgs": Object {},
              "name": "Story Two",
              "parameters": Object {
                "__isArgsStory": false,
                "fileName": "exports-map-0",
                "renderer": "test",
              },
              "tags": Array [
                "component-tag",
                "autodocs",
                "story",
              ],
              "title": "Component C",
              "type": "story",
            },
            "component-d--story-four": Object {
              "argTypes": Object {},
              "args": Object {},
              "id": "component-d--story-four",
              "importPath": "exports-map-1",
              "initialArgs": Object {},
              "name": "Story Four",
              "parameters": Object {
                "__isArgsStory": false,
                "fileName": "exports-map-1",
                "renderer": "test",
              },
              "tags": Array [
                "story",
              ],
              "title": "Component D",
              "type": "story",
            },
          },
          "v": 4,
        }
      `);
      await waitForRender();

      mockChannel.emit.mockClear();
      disposeCallback(module.hot.data);
      configure('test', () => [componentCExports], module as any);

      await waitForEvents([SET_INDEX]);
      expect(mockChannel.emit.mock.calls.find((call) => call[0] === SET_INDEX)?.[1])
        .toMatchInlineSnapshot(`
        Object {
          "entries": Object {
            "component-c--story-one": Object {
              "argTypes": Object {},
              "args": Object {},
              "id": "component-c--story-one",
              "importPath": "exports-map-0",
              "initialArgs": Object {},
              "name": "Story One",
              "parameters": Object {
                "__isArgsStory": false,
                "fileName": "exports-map-0",
                "renderer": "test",
              },
              "tags": Array [
                "story-tag",
                "story",
              ],
              "title": "Component C",
              "type": "story",
            },
            "component-c--story-two": Object {
              "argTypes": Object {},
              "args": Object {},
              "id": "component-c--story-two",
              "importPath": "exports-map-0",
              "initialArgs": Object {},
              "name": "Story Two",
              "parameters": Object {
                "__isArgsStory": false,
                "fileName": "exports-map-0",
                "renderer": "test",
              },
              "tags": Array [
                "component-tag",
                "autodocs",
                "story",
              ],
              "title": "Component C",
              "type": "story",
            },
          },
          "v": 4,
        }
      `);

      await waitForEvents([STORY_UNCHANGED]);
    });

    it('allows you to override the render function in project annotations', async () => {
      const renderToCanvas = jest.fn(({ storyFn }) => storyFn());
      const frameworkRender = jest.fn();

      const { configure } = start(renderToCanvas, { render: frameworkRender });

      const projectRender = jest.fn();
      setGlobalRender(projectRender);
      configure('test', () => {
        return [
          {
            default: {
              title: 'Component A',
              component: jest.fn(),
            },
            StoryOne: {},
          },
        ];
      });

      await waitForRender();
      expect(mockChannel.emit).toHaveBeenCalledWith(STORY_RENDERED, 'component-a--story-one');

      expect(frameworkRender).not.toHaveBeenCalled();
      expect(projectRender).toHaveBeenCalled();
    });

    describe('docs', () => {
      beforeEach(() => {
        global.DOCS_OPTIONS = {};
      });

      // NOTE: MDX files are only ever passed as CSF
      it('sends over docs only stories as entries', async () => {
        const renderToCanvas = jest.fn();

        const { configure } = start(renderToCanvas);

        configure(
          'test',
          makeRequireContext({
            './Introduction.stories.mdx': {
              default: { title: 'Introduction', tags: ['stories-mdx'] },
              _Page: { name: 'Page', parameters: { docsOnly: true } },
            },
          })
        );

        await waitForEvents([SET_INDEX]);
        expect(mockChannel.emit.mock.calls.find((call) => call[0] === SET_INDEX)?.[1])
          .toMatchInlineSnapshot(`
          Object {
            "entries": Object {
              "introduction": Object {
                "id": "introduction",
                "importPath": "./Introduction.stories.mdx",
                "name": undefined,
                "parameters": Object {
                  "fileName": "./Introduction.stories.mdx",
                  "renderer": "test",
                },
                "storiesImports": Array [],
                "tags": Array [
                  "stories-mdx",
                  "docs",
                ],
                "title": "Introduction",
                "type": "docs",
              },
            },
            "v": 4,
          }
        `);

        // Wait a second to let the docs "render" finish (and maybe throw)
        await waitForQuiescence();
      });

      it('errors on .mdx files', async () => {
        const renderToCanvas = jest.fn();

        const { configure } = start(renderToCanvas);

        configure(
          'test',
          makeRequireContext({
            './Introduction.mdx': {
              default: () => 'some mdx function',
            },
          })
        );

        await waitForEvents([CONFIG_ERROR]);
        expect(mockChannel.emit.mock.calls.find((call) => call[0] === CONFIG_ERROR)?.[1])
          .toMatchInlineSnapshot(`
          [Error: Cannot index \`.mdx\` file (\`./Introduction.mdx\`) in \`storyStoreV7: false\` mode.

          The legacy story store does not support new-style \`.mdx\` files. If the file above
          is not intended to be indexed (i.e. displayed as an entry in the sidebar), either
          exclude it from your \`stories\` glob, or add <Meta isTemplate /> to it.

          If you wanted to index the file, you'll need to name it \`stories.mdx\` and stick to the
          legacy (6.x) MDX API, or use the new store.]
        `);
      });
    });
  });

  describe('auto-title', () => {
    const componentDExports = {
      default: {
        component: 'Component D',
      },
      StoryOne: jest.fn(),
    };
    it('loads and renders the first story correctly', async () => {
      const renderToCanvas = jest.fn();

      const { configure } = start(renderToCanvas);
      configure('test', () => [componentDExports]);

      await waitForEvents([SET_INDEX]);
      expect(mockChannel.emit.mock.calls.find((call) => call[0] === SET_INDEX)?.[1])
        .toMatchInlineSnapshot(`
        Object {
          "entries": Object {
            "auto-title--story-one": Object {
              "argTypes": Object {},
              "args": Object {},
              "id": "auto-title--story-one",
              "importPath": "exports-map-0",
              "initialArgs": Object {},
              "name": "Story One",
              "parameters": Object {
                "__isArgsStory": false,
                "fileName": "exports-map-0",
                "renderer": "test",
              },
              "tags": Array [
                "story",
              ],
              "title": "auto-title",
              "type": "story",
            },
          },
          "v": 4,
        }
      `);

      await waitForRender();
    });
  });
});
