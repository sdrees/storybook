import global from 'global';
import * as ReactDOM from 'react-dom';
import merge from 'lodash/merge';
import Events, { IGNORED_EXCEPTION } from '@storybook/core-events';
import { logger } from '@storybook/client-logger';
import { addons, mockChannel as createMockChannel } from '@storybook/addons';
import type { AnyFramework } from '@storybook/csf';
import type { ModuleImportFn } from '@storybook/store';

import { PreviewWeb } from './PreviewWeb';
import {
  componentOneExports,
  componentTwoExports,
  importFn,
  projectAnnotations,
  getProjectAnnotations,
  storyIndex,
  emitter,
  mockChannel,
  waitForEvents,
  waitForRender,
  waitForQuiescence,
  waitForRenderPhase,
} from './PreviewWeb.mockdata';
import type { WebProjectAnnotations } from './types';

jest.mock('./WebView');
const { history, document } = global;

const mockStoryIndex = jest.fn(() => storyIndex);

let mockFetchResult;
jest.mock('global', () => ({
  ...(jest.requireActual('global') as any),
  history: { replaceState: jest.fn() },
  document: {
    location: {
      pathname: 'pathname',
      search: '?id=*',
    },
  },
  window: {
    location: {
      reload: jest.fn(),
    },
  },
  FEATURES: {
    storyStoreV7: true,
    breakingChangesV7: true,
    // xxx
  },
  fetch: async () => mockFetchResult,
}));

jest.mock('@storybook/client-logger');
jest.mock('react-dom');

const createGate = (): [Promise<any | undefined>, (_?: any) => void] => {
  let openGate = (_?: any) => {};
  const gate = new Promise<any | undefined>((resolve) => {
    openGate = resolve;
  });
  return [gate, openGate];
};

// SET_CURRENT_STORY does some stuff in promises, then waits for
// a timer, so we need to first setImmediate (to get past the resolution), then run the timers
// Probably jest modern timers do this but they aren't working for some bizzarre reason.
async function waitForSetCurrentStory() {
  await new Promise((r) => setImmediate(r));
  jest.runAllTimers();
}

async function createAndRenderPreview({
  importFn: inputImportFn = importFn,
  getProjectAnnotations: inputGetProjectAnnotations = getProjectAnnotations,
}: {
  importFn?: ModuleImportFn;
  getProjectAnnotations?: () => WebProjectAnnotations<AnyFramework>;
} = {}) {
  const preview = new PreviewWeb();
  (
    preview.view.prepareForDocs as jest.MockedFunction<typeof preview.view.prepareForDocs>
  ).mockReturnValue('docs-element' as any);
  await preview.initialize({
    importFn: inputImportFn,
    getProjectAnnotations: inputGetProjectAnnotations,
  });
  await waitForRender();

  return preview;
}

beforeEach(() => {
  document.location.search = '';
  mockChannel.emit.mockClear();
  emitter.removeAllListeners();
  componentOneExports.default.loaders[0].mockReset().mockImplementation(async () => ({ l: 7 }));
  componentOneExports.default.parameters.docs.container.mockClear();
  componentOneExports.a.play.mockReset();
  projectAnnotations.renderToDOM.mockReset();
  projectAnnotations.render.mockClear();
  projectAnnotations.decorators[0].mockClear();
  // @ts-ignore
  ReactDOM.render.mockReset().mockImplementation((_: any, _2: any, cb: () => any) => cb());
  // @ts-ignore
  logger.warn.mockClear();
  mockStoryIndex.mockReset().mockReturnValue(storyIndex);

  addons.setChannel(mockChannel as any);
  addons.setServerChannel(createMockChannel());
  mockFetchResult = { status: 200, json: mockStoryIndex, text: () => 'error text' };
});

describe('PreviewWeb', () => {
  describe('initialize', () => {
    it('shows an error if getProjectAnnotations throws', async () => {
      const err = new Error('meta error');
      const preview = new PreviewWeb();
      await expect(
        preview.initialize({
          importFn,
          getProjectAnnotations: () => {
            throw err;
          },
        })
      ).rejects.toThrow(err);

      expect(preview.view.showErrorDisplay).toHaveBeenCalled();
      expect(mockChannel.emit).toHaveBeenCalledWith(Events.CONFIG_ERROR, err);
    });

    it('shows an error if the stories.json endpoint 500s', async () => {
      const err = new Error('sort error');
      mockFetchResult = { status: 500, text: async () => err.toString() };

      const preview = new PreviewWeb();
      await expect(preview.initialize({ importFn, getProjectAnnotations })).rejects.toThrow(
        'sort error'
      );

      expect(preview.view.showErrorDisplay).toHaveBeenCalled();
      expect(mockChannel.emit).toHaveBeenCalledWith(Events.CONFIG_ERROR, expect.any(Error));
    });

    it('sets globals from the URL', async () => {
      document.location.search = '?id=*&globals=a:c';

      const preview = await createAndRenderPreview();

      expect(preview.storyStore.globals.get()).toEqual({ a: 'c' });
    });

    it('emits the SET_GLOBALS event', async () => {
      await createAndRenderPreview();

      expect(mockChannel.emit).toHaveBeenCalledWith(Events.SET_GLOBALS, {
        globals: { a: 'b' },
        globalTypes: {},
      });
    });

    it('SET_GLOBALS sets globals and types even when undefined', async () => {
      await createAndRenderPreview({ getProjectAnnotations: () => ({ renderToDOM: jest.fn() }) });

      expect(mockChannel.emit).toHaveBeenCalledWith(Events.SET_GLOBALS, {
        globals: {},
        globalTypes: {},
      });
    });

    it('emits the SET_GLOBALS event from the URL', async () => {
      document.location.search = '?id=*&globals=a:c';

      await createAndRenderPreview();

      expect(mockChannel.emit).toHaveBeenCalledWith(Events.SET_GLOBALS, {
        globals: { a: 'c' },
        globalTypes: {},
      });
    });

    it('sets args from the URL', async () => {
      document.location.search = '?id=component-one--a&args=foo:url';

      const preview = await createAndRenderPreview();

      expect(preview.storyStore.args.get('component-one--a')).toEqual({
        foo: 'url',
      });
    });
    it('updates args from the URL', async () => {
      document.location.search = '?id=component-one--a&args=foo:url';

      await createAndRenderPreview();

      expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_ARGS_UPDATED, {
        storyId: 'component-one--a',
        args: { foo: 'url' },
      });
    });

    it('allows async getProjectAnnotations', async () => {
      const preview = new PreviewWeb();
      await preview.initialize({
        importFn,
        getProjectAnnotations: async () => {
          return getProjectAnnotations();
        },
      });

      expect(preview.storyStore.globals.get()).toEqual({ a: 'b' });
    });
  });

  describe('initial selection', () => {
    it('selects the story specified in the URL', async () => {
      document.location.search = '?id=component-one--a';

      const preview = await createAndRenderPreview();

      expect(preview.urlStore.selection).toEqual({
        storyId: 'component-one--a',
        viewMode: 'story',
      });
      expect(history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        'pathname?id=component-one--a&viewMode=story'
      );
    });

    it('emits the STORY_SPECIFIED event', async () => {
      document.location.search = '?id=component-one--a';

      await createAndRenderPreview();

      expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_SPECIFIED, {
        storyId: 'component-one--a',
        viewMode: 'story',
      });
    });

    it('emits the CURRENT_STORY_WAS_SET event', async () => {
      document.location.search = '?id=component-one--a';

      await createAndRenderPreview();

      expect(mockChannel.emit).toHaveBeenCalledWith(Events.CURRENT_STORY_WAS_SET, {
        storyId: 'component-one--a',
        viewMode: 'story',
      });
    });

    describe('if the story specified does not exist', () => {
      it('renders a loading error', async () => {
        document.location.search = '?id=random';

        const preview = await createAndRenderPreview();

        expect(preview.view.showErrorDisplay).toHaveBeenCalled();
        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_MISSING, 'random');
      });

      it('tries again with a specifier if CSF file changes', async () => {
        document.location.search = '?id=component-one--d';

        const preview = await createAndRenderPreview();

        expect(preview.view.showErrorDisplay).toHaveBeenCalled();
        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_MISSING, 'component-one--d');

        mockChannel.emit.mockClear();
        const newComponentOneExports = merge({}, componentOneExports, {
          d: { args: { foo: 'd' }, play: jest.fn() },
        });
        const newImportFn = jest.fn(async (path) => {
          return path === './src/ComponentOne.stories.js'
            ? newComponentOneExports
            : componentTwoExports;
        });
        preview.onStoriesChanged({
          importFn: newImportFn,
          storyIndex: {
            v: 3,
            stories: {
              ...storyIndex.stories,
              'component-one--d': {
                id: 'component-one--d',
                title: 'Component One',
                name: 'D',
                importPath: './src/ComponentOne.stories.js',
              },
            },
          },
        });
        await waitForRender();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_SPECIFIED, {
          storyId: 'component-one--d',
          viewMode: 'story',
        });
      });

      describe('after selection changes', () => {
        beforeEach(() => jest.useFakeTimers());
        afterEach(() => jest.useRealTimers());

        it('DOES NOT try again if CSF file changes', async () => {
          document.location.search = '?id=component-one--d';

          const preview = await createAndRenderPreview();

          expect(preview.view.showErrorDisplay).toHaveBeenCalled();
          expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_MISSING, 'component-one--d');

          emitter.emit(Events.SET_CURRENT_STORY, {
            storyId: 'component-one--b',
            viewMode: 'story',
          });
          await waitForSetCurrentStory();

          const newComponentOneExports = merge({}, componentOneExports, {
            d: { args: { foo: 'd' }, play: jest.fn() },
          });
          const newImportFn = jest.fn(async (path) => {
            return path === './src/ComponentOne.stories.js'
              ? newComponentOneExports
              : componentTwoExports;
          });

          preview.onStoriesChanged({
            importFn: newImportFn,
            storyIndex: {
              v: 3,
              stories: {
                ...storyIndex.stories,
                'component-one--d': {
                  id: 'component-one--d',
                  title: 'Component One',
                  name: 'D',
                  importPath: './src/ComponentOne.stories.js',
                },
              },
            },
          });
          expect(mockChannel.emit).not.toHaveBeenCalledWith(Events.STORY_SPECIFIED, {
            storyId: 'component-one--d',
            viewMode: 'story',
          });
        });
      });
    });

    it('renders missing if no selection', async () => {
      const preview = await createAndRenderPreview();

      expect(preview.view.showNoPreview).toHaveBeenCalled();
      expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_MISSING);
    });

    describe('in story viewMode', () => {
      it('calls view.prepareForStory', async () => {
        document.location.search = '?id=component-one--a';

        const preview = await createAndRenderPreview();

        expect(preview.view.prepareForStory).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'component-one--a',
          })
        );
      });

      it('emits STORY_PREPARED', async () => {
        document.location.search = '?id=component-one--a';
        await createAndRenderPreview();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_PREPARED, {
          id: 'component-one--a',
          parameters: {
            __isArgsStory: false,
            docs: { container: expect.any(Function) },
            fileName: './src/ComponentOne.stories.js',
          },
          initialArgs: { foo: 'a' },
          argTypes: { foo: { name: 'foo', type: { name: 'string' } } },
          args: { foo: 'a' },
        });
      });

      it('applies loaders with story context', async () => {
        document.location.search = '?id=component-one--a';
        await createAndRenderPreview();

        expect(componentOneExports.default.loaders[0]).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'component-one--a',
            parameters: {
              __isArgsStory: false,
              docs: { container: expect.any(Function) },
              fileName: './src/ComponentOne.stories.js',
            },
            initialArgs: { foo: 'a' },
            argTypes: { foo: { name: 'foo', type: { name: 'string' } } },
            args: { foo: 'a' },
          })
        );
      });

      it('passes loaded context to renderToDOM', async () => {
        document.location.search = '?id=component-one--a';
        await createAndRenderPreview();

        expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
          expect.objectContaining({
            forceRemount: true,
            storyContext: expect.objectContaining({
              id: 'component-one--a',
              parameters: {
                __isArgsStory: false,
                docs: { container: expect.any(Function) },
                fileName: './src/ComponentOne.stories.js',
              },
              globals: { a: 'b' },
              initialArgs: { foo: 'a' },
              argTypes: { foo: { name: 'foo', type: { name: 'string' } } },
              args: { foo: 'a' },
              loaded: { l: 7 },
            }),
          }),
          undefined // this is coming from view.prepareForStory, not super important
        );
      });

      it('renders exception if a loader throws', async () => {
        const error = new Error('error');
        componentOneExports.default.loaders[0].mockImplementationOnce(() => {
          throw error;
        });

        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_THREW_EXCEPTION, error);
        expect(preview.view.showErrorDisplay).toHaveBeenCalledWith(error);
      });

      it('renders exception if renderToDOM throws', async () => {
        const error = new Error('error');
        projectAnnotations.renderToDOM.mockImplementationOnce(() => {
          throw error;
        });

        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_THREW_EXCEPTION, error);
        expect(preview.view.showErrorDisplay).toHaveBeenCalledWith(error);
      });

      it('renders helpful message if renderToDOM is undefined', async () => {
        const originalRenderToDOM = projectAnnotations.renderToDOM;
        try {
          projectAnnotations.renderToDOM = undefined;

          document.location.search = '?id=component-one--a';
          const preview = new PreviewWeb();
          await expect(preview.initialize({ importFn, getProjectAnnotations })).rejects.toThrow();

          expect(preview.view.showErrorDisplay).toHaveBeenCalled();
          expect((preview.view.showErrorDisplay as jest.Mock).mock.calls[0][0])
            .toMatchInlineSnapshot(`
            [Error: Expected your framework's preset to export a \`renderToDOM\` field.

            Perhaps it needs to be upgraded for Storybook 6.4?

            More info: https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#mainjs-framework-field          ]
          `);
        } finally {
          projectAnnotations.renderToDOM = originalRenderToDOM;
        }
      });

      it('renders exception if the play function throws', async () => {
        const error = new Error('error');
        componentOneExports.a.play.mockImplementationOnce(() => {
          throw error;
        });

        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_THREW_EXCEPTION, error);
        expect(preview.view.showErrorDisplay).toHaveBeenCalledWith(error);
      });

      it('renders error if the story calls showError', async () => {
        const error = { title: 'title', description: 'description' };
        projectAnnotations.renderToDOM.mockImplementationOnce((context) =>
          context.showError(error)
        );

        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_ERRORED, error);
        expect(preview.view.showErrorDisplay).toHaveBeenCalledWith({
          message: error.title,
          stack: error.description,
        });
      });

      it('renders exception if the story calls showException', async () => {
        const error = new Error('error');
        projectAnnotations.renderToDOM.mockImplementationOnce((context) =>
          context.showException(error)
        );

        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_THREW_EXCEPTION, error);
        expect(preview.view.showErrorDisplay).toHaveBeenCalledWith(error);
      });

      it('executes playFunction', async () => {
        document.location.search = '?id=component-one--a';
        await createAndRenderPreview();

        expect(componentOneExports.a.play).toHaveBeenCalled();
      });

      it('emits STORY_RENDERED', async () => {
        document.location.search = '?id=component-one--a';
        await createAndRenderPreview();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_RENDERED, 'component-one--a');
      });

      it('does not show error display if the render function throws IGNORED_EXCEPTION', async () => {
        document.location.search = '?id=component-one--a';
        projectAnnotations.renderToDOM.mockImplementationOnce(() => {
          throw IGNORED_EXCEPTION;
        });

        const preview = new PreviewWeb();
        await preview.initialize({ importFn, getProjectAnnotations });

        await waitForRender();

        expect(mockChannel.emit).toHaveBeenCalledWith(
          Events.STORY_THREW_EXCEPTION,
          IGNORED_EXCEPTION
        );
        expect(preview.view.showErrorDisplay).not.toHaveBeenCalled();
      });
    });

    describe('in docs viewMode', () => {
      it('calls view.prepareForDocs', async () => {
        document.location.search = '?id=component-one--a&viewMode=docs';
        const preview = await createAndRenderPreview();

        expect(preview.view.prepareForDocs).toHaveBeenCalled();
      });

      it('emits STORY_PREPARED', async () => {
        document.location.search = '?id=component-one--a&viewMode=docs';
        await createAndRenderPreview();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_PREPARED, {
          id: 'component-one--a',
          parameters: {
            __isArgsStory: false,
            docs: { container: expect.any(Function) },
            fileName: './src/ComponentOne.stories.js',
          },
          initialArgs: { foo: 'a' },
          argTypes: { foo: { name: 'foo', type: { name: 'string' } } },
          args: { foo: 'a' },
        });
      });

      it('render the docs container with the correct context', async () => {
        document.location.search = '?id=component-one--a&viewMode=docs';

        await createAndRenderPreview();

        expect(ReactDOM.render).toHaveBeenCalledWith(
          expect.objectContaining({
            type: componentOneExports.default.parameters.docs.container,
            props: expect.objectContaining({
              context: expect.objectContaining({
                id: 'component-one--a',
                title: 'Component One',
                name: 'A',
              }),
            }),
          }),
          'docs-element',
          expect.any(Function)
        );
      });

      it('emits DOCS_RENDERED', async () => {
        document.location.search = '?id=component-one--a&viewMode=docs';

        await createAndRenderPreview();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.DOCS_RENDERED, 'component-one--a');
      });
    });
  });

  describe('onUpdateGlobals', () => {
    it('emits GLOBALS_UPDATED', async () => {
      document.location.search = '?id=component-one--a';
      await createAndRenderPreview();

      emitter.emit(Events.UPDATE_GLOBALS, { globals: { foo: 'bar' } });

      await waitForEvents([Events.GLOBALS_UPDATED]);
      expect(mockChannel.emit).toHaveBeenCalledWith(Events.GLOBALS_UPDATED, {
        globals: { a: 'b', foo: 'bar' },
        initialGlobals: { a: 'b' },
      });
    });

    it('sets new globals on the store', async () => {
      document.location.search = '?id=component-one--a';
      const preview = await createAndRenderPreview();

      emitter.emit(Events.UPDATE_GLOBALS, { globals: { foo: 'bar' } });

      expect(preview.storyStore.globals.get()).toEqual({ a: 'b', foo: 'bar' });
    });

    it('passes new globals in context to renderToDOM', async () => {
      document.location.search = '?id=component-one--a';
      const preview = await createAndRenderPreview();

      mockChannel.emit.mockClear();
      projectAnnotations.renderToDOM.mockClear();
      emitter.emit(Events.UPDATE_GLOBALS, { globals: { foo: 'bar' } });
      await waitForRender();

      expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
        expect.objectContaining({
          forceRemount: false,
          storyContext: expect.objectContaining({
            globals: { a: 'b', foo: 'bar' },
          }),
        }),
        undefined // this is coming from view.prepareForStory, not super important
      );
    });

    it('emits STORY_RENDERED', async () => {
      document.location.search = '?id=component-one--a';
      await createAndRenderPreview();

      mockChannel.emit.mockClear();
      emitter.emit(Events.UPDATE_GLOBALS, { globals: { foo: 'bar' } });
      await waitForRender();

      expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_RENDERED, 'component-one--a');
    });

    describe('in docs mode', () => {
      it('re-renders the docs container', async () => {
        document.location.search = '?id=component-one--a&viewMode=docs';

        await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.UPDATE_GLOBALS, { globals: { foo: 'bar' } });
        await waitForRender();

        expect(ReactDOM.render).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('onUpdateArgs', () => {
    it('emits STORY_ARGS_UPDATED', async () => {
      document.location.search = '?id=component-one--a';
      await createAndRenderPreview();

      emitter.emit(Events.UPDATE_STORY_ARGS, {
        storyId: 'component-one--a',
        updatedArgs: { new: 'arg' },
      });

      await waitForEvents([Events.STORY_ARGS_UPDATED]);
      expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_ARGS_UPDATED, {
        storyId: 'component-one--a',
        args: { foo: 'a', new: 'arg' },
      });
    });

    it('sets new args on the store', async () => {
      document.location.search = '?id=component-one--a';
      const preview = await createAndRenderPreview();

      emitter.emit(Events.UPDATE_STORY_ARGS, {
        storyId: 'component-one--a',
        updatedArgs: { new: 'arg' },
      });

      expect(preview.storyStore.args.get('component-one--a')).toEqual({
        foo: 'a',
        new: 'arg',
      });
    });

    it('passes new args in context to renderToDOM', async () => {
      document.location.search = '?id=component-one--a';
      await createAndRenderPreview();

      mockChannel.emit.mockClear();
      projectAnnotations.renderToDOM.mockClear();
      emitter.emit(Events.UPDATE_STORY_ARGS, {
        storyId: 'component-one--a',
        updatedArgs: { new: 'arg' },
      });
      await waitForRender();

      expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
        expect.objectContaining({
          forceRemount: false,
          storyContext: expect.objectContaining({
            initialArgs: { foo: 'a' },
            args: { foo: 'a', new: 'arg' },
          }),
        }),
        undefined // this is coming from view.prepareForStory, not super important
      );
    });

    it('emits STORY_RENDERED', async () => {
      document.location.search = '?id=component-one--a';
      await createAndRenderPreview();

      mockChannel.emit.mockClear();
      emitter.emit(Events.UPDATE_STORY_ARGS, {
        storyId: 'component-one--a',
        updatedArgs: { new: 'arg' },
      });
      await waitForRender();

      expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_RENDERED, 'component-one--a');
    });

    describe('while story is still rendering', () => {
      it('runs loaders again', async () => {
        const [gate, openGate] = createGate();

        document.location.search = '?id=component-one--a';
        componentOneExports.default.loaders[0].mockImplementationOnce(async () => gate);

        await new PreviewWeb().initialize({ importFn, getProjectAnnotations });
        await waitForRenderPhase('loading');

        expect(componentOneExports.default.loaders[0]).toHaveBeenCalledWith(
          expect.objectContaining({
            args: { foo: 'a' },
          })
        );

        componentOneExports.default.loaders[0].mockClear();
        emitter.emit(Events.UPDATE_STORY_ARGS, {
          storyId: 'component-one--a',
          updatedArgs: { new: 'arg' },
        });
        await waitForRender();

        expect(componentOneExports.default.loaders[0]).toHaveBeenCalledWith(
          expect.objectContaining({
            args: { foo: 'a', new: 'arg' },
          })
        );

        // Story gets rendered with updated args
        expect(projectAnnotations.renderToDOM).toHaveBeenCalledTimes(1);
        expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
          expect.objectContaining({
            forceRemount: true, // Wasn't yet rendered so we need to force remount
            storyContext: expect.objectContaining({
              loaded: { l: 7 }, // This is the value returned by the *second* loader call
              args: { foo: 'a', new: 'arg' },
            }),
          }),
          undefined // this is coming from view.prepareForStory, not super important
        );

        // Now let the first loader call resolve
        mockChannel.emit.mockClear();
        projectAnnotations.renderToDOM.mockClear();
        openGate({ l: 8 });
        await waitForRender();

        // Now the first call comes through, but picks up the new args
        // Note this isn't a particularly realistic case (the second loader being quicker than the first)
        expect(projectAnnotations.renderToDOM).toHaveBeenCalledTimes(1);
        expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
          expect.objectContaining({
            storyContext: expect.objectContaining({
              loaded: { l: 8 },
              args: { foo: 'a', new: 'arg' },
            }),
          }),
          undefined // this is coming from view.prepareForStory, not super important
        );
      });

      it('renders a second time if renderToDOM is running', async () => {
        const [gate, openGate] = createGate();

        document.location.search = '?id=component-one--a';
        projectAnnotations.renderToDOM.mockImplementationOnce(async () => gate);

        await new PreviewWeb().initialize({ importFn, getProjectAnnotations });
        await waitForRenderPhase('rendering');

        emitter.emit(Events.UPDATE_STORY_ARGS, {
          storyId: 'component-one--a',
          updatedArgs: { new: 'arg' },
        });

        // Now let the renderToDOM call resolve
        openGate();
        await waitForRender();

        expect(projectAnnotations.renderToDOM).toHaveBeenCalledTimes(2);
        expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
          expect.objectContaining({
            forceRemount: true,
            storyContext: expect.objectContaining({
              loaded: { l: 7 },
              args: { foo: 'a' },
            }),
          }),
          undefined // this is coming from view.prepareForStory, not super important
        );
        expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
          expect.objectContaining({
            forceRemount: false,
            storyContext: expect.objectContaining({
              loaded: { l: 7 },
              args: { foo: 'a', new: 'arg' },
            }),
          }),
          undefined // this is coming from view.prepareForStory, not super important
        );
      });

      it('works if it is called directly from inside non async renderToDOM', async () => {
        document.location.search = '?id=component-one--a';
        projectAnnotations.renderToDOM.mockImplementationOnce(() => {
          emitter.emit(Events.UPDATE_STORY_ARGS, {
            storyId: 'component-one--a',
            updatedArgs: { new: 'arg' },
          });
        });
        await createAndRenderPreview();

        expect(projectAnnotations.renderToDOM).toHaveBeenCalledTimes(2);
        expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
          expect.objectContaining({
            forceRemount: true,
            storyContext: expect.objectContaining({
              loaded: { l: 7 },
              args: { foo: 'a' },
            }),
          }),
          undefined // this is coming from view.prepareForStory, not super important
        );
        expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
          expect.objectContaining({
            forceRemount: false,
            storyContext: expect.objectContaining({
              loaded: { l: 7 },
              args: { foo: 'a', new: 'arg' },
            }),
          }),
          undefined // this is coming from view.prepareForStory, not super important
        );
      });

      it('calls renderToDOM again if play function is running', async () => {
        const [gate, openGate] = createGate();
        componentOneExports.a.play.mockImplementationOnce(async () => gate);

        const renderToDOMCalled = new Promise((resolve) => {
          projectAnnotations.renderToDOM.mockImplementationOnce(() => {
            resolve(null);
          });
        });

        document.location.search = '?id=component-one--a';
        await new PreviewWeb().initialize({ importFn, getProjectAnnotations });
        await waitForRenderPhase('playing');

        await renderToDOMCalled;
        // Story gets rendered with original args
        expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
          expect.objectContaining({
            forceRemount: true,
            storyContext: expect.objectContaining({
              loaded: { l: 7 },
              args: { foo: 'a' },
            }),
          }),
          undefined // this is coming from view.prepareForStory, not super important
        );

        emitter.emit(Events.UPDATE_STORY_ARGS, {
          storyId: 'component-one--a',
          updatedArgs: { new: 'arg' },
        });

        // The second call should emit STORY_RENDERED
        await waitForRender();

        // Story gets rendered with updated args
        expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
          expect.objectContaining({
            forceRemount: false,
            storyContext: expect.objectContaining({
              loaded: { l: 7 },
              args: { foo: 'a', new: 'arg' },
            }),
          }),
          undefined // this is coming from view.prepareForStory, not super important
        );

        // Now let the playFunction call resolve
        openGate();
      });
    });

    describe('in docs mode, old inline render', () => {
      it('re-renders the docs container', async () => {
        document.location.search = '?id=component-one--a&viewMode=docs';

        await createAndRenderPreview();

        (ReactDOM.render as jest.MockedFunction<typeof ReactDOM.render>).mockClear();
        mockChannel.emit.mockClear();
        emitter.emit(Events.UPDATE_STORY_ARGS, {
          storyId: 'component-one--a',
          updatedArgs: { new: 'arg' },
        });
        await waitForRender();

        expect(ReactDOM.render).toHaveBeenCalledTimes(1);
      });
    });

    describe('in docs mode, modern inline render', () => {
      beforeEach(() => {
        global.FEATURES.modernInlineRender = true;
      });
      afterEach(() => {
        global.FEATURES.modernInlineRender = true;
      });
      it('does not re-render the docs container', async () => {
        document.location.search = '?id=component-one--a&viewMode=docs';

        await createAndRenderPreview();

        (ReactDOM.render as jest.MockedFunction<typeof ReactDOM.render>).mockClear();
        mockChannel.emit.mockClear();
        emitter.emit(Events.UPDATE_STORY_ARGS, {
          storyId: 'component-one--a',
          updatedArgs: { new: 'arg' },
        });
        await waitForEvents([Events.STORY_ARGS_UPDATED]);

        expect(ReactDOM.render).not.toHaveBeenCalled();
      });

      describe('when renderStoryToElement was called', () => {
        it('re-renders the story', async () => {
          document.location.search = '?id=component-one--a&viewMode=docs';

          const preview = await createAndRenderPreview();
          await waitForRender();

          mockChannel.emit.mockClear();
          const story = await preview.storyStore.loadStory({ storyId: 'component-one--a' });
          preview.renderStoryToElement(story, 'story-element' as any);
          await waitForRender();

          expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
            expect.objectContaining({
              storyContext: expect.objectContaining({
                args: { foo: 'a' },
              }),
            }),
            'story-element'
          );

          (ReactDOM.render as jest.MockedFunction<typeof ReactDOM.render>).mockClear();
          mockChannel.emit.mockClear();
          emitter.emit(Events.UPDATE_STORY_ARGS, {
            storyId: 'component-one--a',
            updatedArgs: { new: 'arg' },
          });
          await waitForRender();

          expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
            expect.objectContaining({
              storyContext: expect.objectContaining({
                args: { foo: 'a', new: 'arg' },
              }),
            }),
            'story-element'
          );
        });
      });
    });
  });

  describe('onResetArgs', () => {
    it('emits STORY_ARGS_UPDATED', async () => {
      document.location.search = '?id=component-one--a';
      await createAndRenderPreview();

      mockChannel.emit.mockClear();
      emitter.emit(Events.UPDATE_STORY_ARGS, {
        storyId: 'component-one--a',
        updatedArgs: { foo: 'new' },
      });

      await waitForEvents([Events.STORY_ARGS_UPDATED]);
      expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_ARGS_UPDATED, {
        storyId: 'component-one--a',
        args: { foo: 'new' },
      });

      mockChannel.emit.mockClear();
      emitter.emit(Events.RESET_STORY_ARGS, {
        storyId: 'component-one--a',
        argNames: ['foo'],
      });

      await waitForEvents([Events.STORY_ARGS_UPDATED]);

      expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_ARGS_UPDATED, {
        storyId: 'component-one--a',
        args: { foo: 'a' },
      });
    });

    it('resets a single arg', async () => {
      document.location.search = '?id=component-one--a';
      await createAndRenderPreview();

      mockChannel.emit.mockClear();
      emitter.emit(Events.UPDATE_STORY_ARGS, {
        storyId: 'component-one--a',
        updatedArgs: { foo: 'new', new: 'value' },
      });
      await waitForEvents([Events.STORY_ARGS_UPDATED]);

      mockChannel.emit.mockClear();
      emitter.emit(Events.RESET_STORY_ARGS, {
        storyId: 'component-one--a',
        argNames: ['foo'],
      });

      await waitForRender();

      expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
        expect.objectContaining({
          forceRemount: false,
          storyContext: expect.objectContaining({
            initialArgs: { foo: 'a' },
            args: { foo: 'a', new: 'value' },
          }),
        }),
        undefined // this is coming from view.prepareForStory, not super important
      );

      await waitForEvents([Events.STORY_ARGS_UPDATED]);
      expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_ARGS_UPDATED, {
        storyId: 'component-one--a',
        args: { foo: 'a', new: 'value' },
      });
    });

    it('resets all args', async () => {
      document.location.search = '?id=component-one--a';
      await createAndRenderPreview();

      emitter.emit(Events.UPDATE_STORY_ARGS, {
        storyId: 'component-one--a',
        updatedArgs: { foo: 'new', new: 'value' },
      });
      await waitForEvents([Events.STORY_ARGS_UPDATED]);

      mockChannel.emit.mockClear();
      emitter.emit(Events.RESET_STORY_ARGS, {
        storyId: 'component-one--a',
      });

      await waitForRender();

      expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
        expect.objectContaining({
          forceRemount: false,
          storyContext: expect.objectContaining({
            initialArgs: { foo: 'a' },
            args: { foo: 'a' },
          }),
        }),
        undefined // this is coming from view.prepareForStory, not super important
      );

      await waitForEvents([Events.STORY_ARGS_UPDATED]);
      expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_ARGS_UPDATED, {
        storyId: 'component-one--a',
        args: { foo: 'a' },
      });
    });
  });

  describe('on FORCE_RE_RENDER', () => {
    it('rerenders the story with the same args', async () => {
      document.location.search = '?id=component-one--a';
      await createAndRenderPreview();

      mockChannel.emit.mockClear();
      projectAnnotations.renderToDOM.mockClear();
      emitter.emit(Events.FORCE_RE_RENDER);
      await waitForRender();

      expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
        expect.objectContaining({ forceRemount: false }),
        undefined // this is coming from view.prepareForStory, not super important
      );
    });
  });

  describe('on FORCE_REMOUNT', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    it('remounts the story with the same args', async () => {
      document.location.search = '?id=component-one--a';
      await createAndRenderPreview();

      mockChannel.emit.mockClear();
      projectAnnotations.renderToDOM.mockClear();
      emitter.emit(Events.FORCE_REMOUNT, { storyId: 'component-one--a' });
      await waitForRender();

      expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
        expect.objectContaining({ forceRemount: true }),
        undefined // this is coming from view.prepareForStory, not super important
      );
    });

    it('aborts render function for initial story', async () => {
      const [gate, openGate] = createGate();

      document.location.search = '?id=component-one--a';
      projectAnnotations.renderToDOM.mockImplementationOnce(async () => gate);
      await new PreviewWeb().initialize({ importFn, getProjectAnnotations });
      await waitForRenderPhase('rendering');

      expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
        expect.objectContaining({
          forceRemount: true,
          storyContext: expect.objectContaining({
            id: 'component-one--a',
            loaded: { l: 7 },
          }),
        }),
        undefined // this is coming from view.prepareForStory, not super important
      );

      mockChannel.emit.mockClear();
      emitter.emit(Events.FORCE_REMOUNT, { storyId: 'component-one--a' });
      await waitForSetCurrentStory();

      // Now let the renderToDOM call resolve
      openGate();
      await waitForRenderPhase('aborted');
      await waitForSetCurrentStory();

      await waitForRenderPhase('rendering');
      expect(projectAnnotations.renderToDOM).toHaveBeenCalledTimes(2);

      await waitForRenderPhase('playing');
      expect(componentOneExports.a.play).toHaveBeenCalledTimes(1);

      await waitForRenderPhase('completed');
      expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_RENDERED, 'component-one--a');

      await waitForQuiescence();
    });
  });

  describe('onSetCurrentStory', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    it('updates URL', async () => {
      document.location.search = '?id=component-one--a';
      await createAndRenderPreview();

      emitter.emit(Events.SET_CURRENT_STORY, {
        storyId: 'component-one--b',
        viewMode: 'story',
      });
      await waitForSetCurrentStory();

      expect(history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        'pathname?id=component-one--b&viewMode=story'
      );
    });

    it('emits CURRENT_STORY_WAS_SET', async () => {
      document.location.search = '?id=component-one--a';
      await createAndRenderPreview();

      emitter.emit(Events.SET_CURRENT_STORY, {
        storyId: 'component-one--b',
        viewMode: 'story',
      });
      await waitForSetCurrentStory();

      expect(mockChannel.emit).toHaveBeenCalledWith(Events.CURRENT_STORY_WAS_SET, {
        storyId: 'component-one--b',
        viewMode: 'story',
      });
    });

    it('renders loading error if the story specified does not exist', async () => {
      document.location.search = '?id=component-one--a';
      const preview = await createAndRenderPreview();

      emitter.emit(Events.SET_CURRENT_STORY, {
        storyId: 'random',
        viewMode: 'story',
      });
      await waitForSetCurrentStory();

      await waitForEvents([Events.STORY_MISSING]);
      expect(preview.view.showErrorDisplay).toHaveBeenCalled();
      expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_MISSING, 'random');
    });

    describe('if called before the preview is initialized', () => {
      it('still renders the selected story, once ready', async () => {
        document.location.search = '';
        // We intentionally are *not* awaiting here
        new PreviewWeb().initialize({ importFn, getProjectAnnotations });

        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--b',
          viewMode: 'story',
        });

        await waitForEvents([Events.STORY_RENDERED]);
        expect(mockChannel.emit).toHaveBeenCalledWith(Events.CURRENT_STORY_WAS_SET, {
          storyId: 'component-one--b',
          viewMode: 'story',
        });
        expect(history.replaceState).toHaveBeenCalledWith(
          {},
          '',
          'pathname?id=component-one--b&viewMode=story'
        );
        expect(mockChannel.emit).not.toHaveBeenCalledWith(Events.STORY_MISSING, 'component-one--b');
        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_RENDERED, 'component-one--b');
      });
    });

    describe('if the selection is unchanged', () => {
      it('emits STORY_UNCHANGED', async () => {
        document.location.search = '?id=component-one--a';
        await createAndRenderPreview();

        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();

        await waitForEvents([Events.STORY_UNCHANGED]);
        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_UNCHANGED, 'component-one--a');
      });

      it('does NOT call renderToDOM', async () => {
        document.location.search = '?id=component-one--a';
        await createAndRenderPreview();

        projectAnnotations.renderToDOM.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();

        // The renderToDOM would have been async so we need to wait a tick.
        await waitForQuiescence();
        expect(projectAnnotations.renderToDOM).not.toHaveBeenCalled();
      });

      // For https://github.com/storybookjs/storybook/issues/17214
      it('does NOT render a second time if preparing', async () => {
        document.location.search = '?id=component-one--a';

        const [gate, openGate] = createGate();
        const [importedGate, openImportedGate] = createGate();
        importFn
          .mockImplementationOnce(async (...args) => {
            await gate;
            return importFn(...args);
          })
          .mockImplementationOnce(async (...args) => {
            // The second time we `import()` we open the "imported" gate
            openImportedGate();
            await gate;
            return importFn(...args);
          });

        const preview = new PreviewWeb();
        // We can't wait for the initialize function, as it waits for `renderSelection()`
        // which prepares, but it does emit `CURRENT_STORY_WAS_SET` right before that
        preview.initialize({ importFn, getProjectAnnotations });
        await waitForEvents([Events.CURRENT_STORY_WAS_SET]);

        mockChannel.emit.mockClear();
        projectAnnotations.renderToDOM.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'story',
        });
        await importedGate;
        // We are blocking import so this won't render yet
        expect(projectAnnotations.renderToDOM).not.toHaveBeenCalled();

        mockChannel.emit.mockClear();
        openGate();
        await waitForRender();

        // We should only render *once*
        expect(projectAnnotations.renderToDOM).toHaveBeenCalledTimes(1);

        // We should not show an error either
        expect(preview.view.showErrorDisplay).not.toHaveBeenCalled();
      });
    });

    describe('when changing story in story viewMode', () => {
      it('updates URL', async () => {
        document.location.search = '?id=component-one--a';
        await createAndRenderPreview();

        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--b',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();

        expect(history.replaceState).toHaveBeenCalledWith(
          {},
          '',
          'pathname?id=component-one--b&viewMode=story'
        );
      });

      it('renders preparing state', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--b',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();

        expect(preview.view.showPreparingStory).toHaveBeenCalled();
      });

      it('emits STORY_CHANGED', async () => {
        document.location.search = '?id=component-one--a';
        await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--b',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();

        await waitForEvents([Events.STORY_CHANGED]);
        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_CHANGED, 'component-one--b');
      });

      it('emits STORY_PREPARED', async () => {
        document.location.search = '?id=component-one--a';
        await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--b',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();

        await waitForEvents([Events.STORY_PREPARED]);
        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_PREPARED, {
          id: 'component-one--b',
          parameters: {
            __isArgsStory: false,
            docs: { container: expect.any(Function) },
            fileName: './src/ComponentOne.stories.js',
          },
          initialArgs: { foo: 'b' },
          argTypes: { foo: { name: 'foo', type: { name: 'string' } } },
          args: { foo: 'b' },
        });
      });

      it('applies loaders with story context', async () => {
        document.location.search = '?id=component-one--a';
        await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--b',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();

        await waitForRender();
        expect(componentOneExports.default.loaders[0]).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'component-one--b',
            parameters: {
              __isArgsStory: false,
              docs: { container: expect.any(Function) },
              fileName: './src/ComponentOne.stories.js',
            },
            initialArgs: { foo: 'b' },
            argTypes: { foo: { name: 'foo', type: { name: 'string' } } },
            args: { foo: 'b' },
          })
        );
      });

      it('passes loaded context to renderToDOM', async () => {
        document.location.search = '?id=component-one--a';
        await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--b',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();
        await waitForRender();

        expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
          expect.objectContaining({
            forceRemount: true,
            storyContext: expect.objectContaining({
              id: 'component-one--b',
              parameters: {
                __isArgsStory: false,
                docs: { container: expect.any(Function) },
                fileName: './src/ComponentOne.stories.js',
              },
              globals: { a: 'b' },
              initialArgs: { foo: 'b' },
              argTypes: { foo: { name: 'foo', type: { name: 'string' } } },
              args: { foo: 'b' },
              loaded: { l: 7 },
            }),
          }),
          undefined // this is coming from view.prepareForStory, not super important
        );
      });

      it('renders exception if renderToDOM throws', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        const error = new Error('error');
        projectAnnotations.renderToDOM.mockImplementationOnce(() => {
          throw error;
        });

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--b',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();
        await waitForRender();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_THREW_EXCEPTION, error);
        expect(preview.view.showErrorDisplay).toHaveBeenCalledWith(error);
      });

      it('renders error if the story calls showError', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        const error = { title: 'title', description: 'description' };
        projectAnnotations.renderToDOM.mockImplementationOnce((context) =>
          context.showError(error)
        );

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--b',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();
        await waitForRender();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_ERRORED, error);
        expect(preview.view.showErrorDisplay).toHaveBeenCalledWith({
          message: error.title,
          stack: error.description,
        });
      });

      it('renders exception if the story calls showException', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        const error = new Error('error');
        projectAnnotations.renderToDOM.mockImplementationOnce((context) =>
          context.showException(error)
        );

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--b',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();
        await waitForRender();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_THREW_EXCEPTION, error);
        expect(preview.view.showErrorDisplay).toHaveBeenCalledWith(error);
      });

      it('executes playFunction', async () => {
        document.location.search = '?id=component-one--a';
        await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--b',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();
        await waitForRender();

        expect(componentOneExports.b.play).toHaveBeenCalled();
      });

      it('emits STORY_RENDERED', async () => {
        document.location.search = '?id=component-one--a';
        await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--b',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();
        await waitForRender();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_RENDERED, 'component-one--b');
      });

      it('retains any arg changes', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.UPDATE_STORY_ARGS, {
          storyId: 'component-one--a',
          updatedArgs: { foo: 'updated' },
        });
        await waitForRender();
        expect(preview.storyStore.args.get('component-one--a')).toEqual({
          foo: 'updated',
        });

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--b',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();
        await waitForRender();
        expect(preview.storyStore.args.get('component-one--a')).toEqual({
          foo: 'updated',
        });

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();
        await waitForRender();
        expect(preview.storyStore.args.get('component-one--a')).toEqual({
          foo: 'updated',
        });
      });

      describe('while story is still rendering', () => {
        it('stops initial story after loaders if running', async () => {
          const [gate, openGate] = createGate();
          componentOneExports.default.loaders[0].mockImplementationOnce(async () => gate);

          document.location.search = '?id=component-one--a';
          await new PreviewWeb().initialize({ importFn, getProjectAnnotations });
          await waitForRenderPhase('loading');

          emitter.emit(Events.SET_CURRENT_STORY, {
            storyId: 'component-one--b',
            viewMode: 'story',
          });
          await waitForSetCurrentStory();
          await waitForRender();

          // Now let the loader resolve
          openGate({ l: 8 });
          await waitForRender();

          // Story gets rendered with updated args
          expect(projectAnnotations.renderToDOM).toHaveBeenCalledTimes(1);
          expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
            expect.objectContaining({
              forceRemount: true,
              storyContext: expect.objectContaining({
                id: 'component-one--b',
                loaded: { l: 7 },
              }),
            }),
            undefined // this is coming from view.prepareForStory, not super important
          );
        });

        it('aborts render for initial story', async () => {
          const [gate, openGate] = createGate();

          document.location.search = '?id=component-one--a';
          projectAnnotations.renderToDOM.mockImplementationOnce(async () => gate);
          await new PreviewWeb().initialize({ importFn, getProjectAnnotations });
          await waitForRenderPhase('rendering');

          mockChannel.emit.mockClear();
          emitter.emit(Events.SET_CURRENT_STORY, {
            storyId: 'component-one--b',
            viewMode: 'story',
          });
          await waitForSetCurrentStory();

          // Now let the renderToDOM call resolve
          openGate();
          await waitForRenderPhase('aborted');
          await waitForSetCurrentStory();

          await waitForRenderPhase('rendering');
          expect(projectAnnotations.renderToDOM).toHaveBeenCalledTimes(2);

          await waitForRenderPhase('playing');
          expect(componentOneExports.a.play).not.toHaveBeenCalled();
          expect(componentOneExports.b.play).toHaveBeenCalled();

          await waitForRenderPhase('completed');
          expect(mockChannel.emit).not.toHaveBeenCalledWith(
            Events.STORY_RENDERED,
            'component-one--a'
          );
          expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_RENDERED, 'component-one--b');

          await waitForQuiescence();
        });

        it('aborts play function for initial story', async () => {
          const [gate, openGate] = createGate();
          componentOneExports.a.play.mockImplementationOnce(async () => gate);

          document.location.search = '?id=component-one--a';
          await new PreviewWeb().initialize({ importFn, getProjectAnnotations });
          await waitForRenderPhase('playing');

          expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
            expect.objectContaining({
              forceRemount: true,
              storyContext: expect.objectContaining({
                id: 'component-one--a',
                loaded: { l: 7 },
              }),
            }),
            undefined // this is coming from view.prepareForStory, not super important
          );

          mockChannel.emit.mockClear();
          emitter.emit(Events.SET_CURRENT_STORY, {
            storyId: 'component-one--b',
            viewMode: 'story',
          });
          await waitForSetCurrentStory();

          // Now let the playFunction call resolve
          openGate();
          await waitForRenderPhase('aborted');
          await waitForSetCurrentStory();

          await waitForRenderPhase('rendering');
          expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_CHANGED, 'component-one--b');
          expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
            expect.objectContaining({
              forceRemount: true,
              storyContext: expect.objectContaining({
                id: 'component-one--b',
                loaded: { l: 7 },
              }),
            }),
            undefined // this is coming from view.prepareForStory, not super important
          );

          await waitForRenderPhase('playing');
          await waitForRenderPhase('completed');
          expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_RENDERED, 'component-one--b');

          // Final story rendered is not emitted for the first story
          await waitForQuiescence();
          expect(mockChannel.emit).not.toHaveBeenCalledWith(
            Events.STORY_RENDERED,
            'component-one--a'
          );
        });

        it('reloads page if playFunction fails to abort in time', async () => {
          const [gate] = createGate();
          componentOneExports.a.play.mockImplementationOnce(async () => gate);

          document.location.search = '?id=component-one--a';
          await new PreviewWeb().initialize({ importFn, getProjectAnnotations });
          await waitForRenderPhase('playing');

          expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
            expect.objectContaining({
              forceRemount: true,
              storyContext: expect.objectContaining({
                id: 'component-one--a',
                loaded: { l: 7 },
              }),
            }),
            undefined // this is coming from view.prepareForStory, not super important
          );

          mockChannel.emit.mockClear();
          emitter.emit(Events.SET_CURRENT_STORY, {
            storyId: 'component-one--b',
            viewMode: 'story',
          });

          // Wait three ticks without resolving the play function
          await waitForSetCurrentStory();
          await waitForSetCurrentStory();
          await waitForSetCurrentStory();

          expect(global.window.location.reload).toHaveBeenCalled();
          expect(mockChannel.emit).not.toHaveBeenCalledWith(
            Events.STORY_CHANGED,
            'component-one--b'
          );
          expect(projectAnnotations.renderToDOM).not.toHaveBeenCalledWith(
            expect.objectContaining({
              storyContext: expect.objectContaining({ id: 'component-one--b' }),
            }),
            undefined
          );
        });
      });
    });

    describe('when changing from story viewMode to docs', () => {
      it('updates URL', async () => {
        document.location.search = '?id=component-one--a';
        await createAndRenderPreview();

        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'docs',
        });
        await waitForSetCurrentStory();

        expect(history.replaceState).toHaveBeenCalledWith(
          {},
          '',
          'pathname?id=component-one--a&viewMode=docs'
        );
      });

      it('renders preparing state', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'docs',
        });
        await waitForSetCurrentStory();

        expect(preview.view.showPreparingDocs).toHaveBeenCalled();
      });

      it('emits STORY_CHANGED', async () => {
        document.location.search = '?id=component-one--a';
        await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'docs',
        });
        await waitForSetCurrentStory();

        await waitForEvents([Events.STORY_CHANGED]);
        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_CHANGED, 'component-one--a');
      });

      it('calls view.prepareForDocs', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'docs',
        });
        await waitForSetCurrentStory();
        await waitForRender();

        expect(preview.view.prepareForDocs).toHaveBeenCalled();
      });

      it('render the docs container with the correct context', async () => {
        document.location.search = '?id=component-one--a';
        await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'docs',
        });
        await waitForSetCurrentStory();
        await waitForRender();

        expect(ReactDOM.render).toHaveBeenCalledWith(
          expect.objectContaining({
            type: componentOneExports.default.parameters.docs.container,
            props: expect.objectContaining({
              context: expect.objectContaining({
                id: 'component-one--a',
                title: 'Component One',
                name: 'A',
              }),
            }),
          }),
          'docs-element',
          expect.any(Function)
        );
      });

      it('emits DOCS_RENDERED', async () => {
        document.location.search = '?id=component-one--a';
        await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'docs',
        });
        await waitForSetCurrentStory();
        await waitForRender();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.DOCS_RENDERED, 'component-one--a');
      });
    });

    describe('when changing from docs viewMode to story', () => {
      it('updates URL', async () => {
        document.location.search = '?id=component-one--a&viewMode=docs';
        await createAndRenderPreview();

        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();

        expect(history.replaceState).toHaveBeenCalledWith(
          {},
          '',
          'pathname?id=component-one--a&viewMode=story'
        );
      });

      it('unmounts docs', async () => {
        document.location.search = '?id=component-one--a&viewMode=docs';
        await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();
        await waitForRender();

        expect(ReactDOM.unmountComponentAtNode).toHaveBeenCalled();
      });

      // NOTE: I am not sure this entirely makes sense but this is the behaviour from 6.3
      it('emits STORY_CHANGED', async () => {
        document.location.search = '?id=component-one--a&viewMode=docs';
        await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();

        await waitForEvents([Events.STORY_CHANGED]);
        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_CHANGED, 'component-one--a');
      });

      it('calls view.prepareForStory', async () => {
        document.location.search = '?id=component-one--a&viewMode=docs';
        const preview = await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();
        await waitForRender();

        expect(preview.view.prepareForStory).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'component-one--a',
          })
        );
      });

      it('emits STORY_PREPARED', async () => {
        document.location.search = '?id=component-one--a&viewMode=docs';
        await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();

        await waitForEvents([Events.STORY_PREPARED]);
        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_PREPARED, {
          id: 'component-one--a',
          parameters: {
            __isArgsStory: false,
            docs: { container: expect.any(Function) },
            fileName: './src/ComponentOne.stories.js',
          },
          initialArgs: { foo: 'a' },
          argTypes: { foo: { name: 'foo', type: { name: 'string' } } },
          args: { foo: 'a' },
        });
      });

      it('applies loaders with story context', async () => {
        document.location.search = '?id=component-one--a&viewMode=docs';
        await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();

        await waitForRender();
        expect(componentOneExports.default.loaders[0]).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'component-one--a',
            parameters: {
              __isArgsStory: false,
              docs: { container: expect.any(Function) },
              fileName: './src/ComponentOne.stories.js',
            },
            initialArgs: { foo: 'a' },
            argTypes: { foo: { name: 'foo', type: { name: 'string' } } },
            args: { foo: 'a' },
          })
        );
      });

      it('passes loaded context to renderToDOM', async () => {
        document.location.search = '?id=component-one--a&viewMode=docs';
        await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();
        await waitForRender();

        expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
          expect.objectContaining({
            forceRemount: true,
            storyContext: expect.objectContaining({
              id: 'component-one--a',
              parameters: {
                __isArgsStory: false,
                docs: { container: expect.any(Function) },
                fileName: './src/ComponentOne.stories.js',
              },
              globals: { a: 'b' },
              initialArgs: { foo: 'a' },
              argTypes: { foo: { name: 'foo', type: { name: 'string' } } },
              args: { foo: 'a' },
              loaded: { l: 7 },
            }),
          }),
          undefined // this is coming from view.prepareForStory, not super important
        );
      });

      it('renders exception if renderToDOM throws', async () => {
        document.location.search = '?id=component-one--a&viewMode=docs';
        const preview = await createAndRenderPreview();

        const error = new Error('error');
        projectAnnotations.renderToDOM.mockImplementationOnce(() => {
          throw error;
        });

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();
        await waitForRender();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_THREW_EXCEPTION, error);
        expect(preview.view.showErrorDisplay).toHaveBeenCalledWith(error);
      });

      it('renders error if the story calls showError', async () => {
        const error = { title: 'title', description: 'description' };
        projectAnnotations.renderToDOM.mockImplementationOnce((context) =>
          context.showError(error)
        );

        document.location.search = '?id=component-one--a&viewMode=docs';
        const preview = await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();
        await waitForRender();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_ERRORED, error);
        expect(preview.view.showErrorDisplay).toHaveBeenCalledWith({
          message: error.title,
          stack: error.description,
        });
      });

      it('renders exception if the story calls showException', async () => {
        const error = new Error('error');
        projectAnnotations.renderToDOM.mockImplementationOnce((context) =>
          context.showException(error)
        );

        document.location.search = '?id=component-one--a&viewMode=docs';
        const preview = await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();
        await waitForRender();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_THREW_EXCEPTION, error);
        expect(preview.view.showErrorDisplay).toHaveBeenCalledWith(error);
      });

      it('executes playFunction', async () => {
        document.location.search = '?id=component-one--a&viewMode=docs';
        await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();
        await waitForRender();

        expect(componentOneExports.a.play).toHaveBeenCalled();
      });

      it('emits STORY_RENDERED', async () => {
        document.location.search = '?id=component-one--a&viewMode=docs';
        await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();
        await waitForRender();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_RENDERED, 'component-one--a');
      });
    });
  });

  describe('onStoriesChanged', () => {
    describe('if stories.json endpoint 500s initially', () => {
      it('recovers and renders the story', async () => {
        document.location.search = '?id=component-one--a';
        const err = new Error('sort error');
        mockFetchResult = { status: 500, text: async () => err.toString() };

        const preview = new PreviewWeb();
        await expect(preview.initialize({ importFn, getProjectAnnotations })).rejects.toThrow(
          'sort error'
        );

        expect(preview.view.showErrorDisplay).toHaveBeenCalled();
        expect(mockChannel.emit).toHaveBeenCalledWith(Events.CONFIG_ERROR, expect.any(Error));

        mockChannel.emit.mockClear();
        mockFetchResult = { status: 200, json: mockStoryIndex, text: () => 'error text' };
        preview.onStoryIndexChanged();
        await waitForRender();
        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_RENDERED, 'component-one--a');
      });

      it('sets story args from the URL', async () => {
        document.location.search = '?id=component-one--a&args=foo:url';
        const err = new Error('sort error');
        mockFetchResult = { status: 500, text: async () => err.toString() };

        const preview = new PreviewWeb();
        await expect(preview.initialize({ importFn, getProjectAnnotations })).rejects.toThrow(
          'sort error'
        );

        expect(preview.view.showErrorDisplay).toHaveBeenCalled();
        expect(mockChannel.emit).toHaveBeenCalledWith(Events.CONFIG_ERROR, expect.any(Error));

        mockChannel.emit.mockClear();
        mockFetchResult = { status: 200, json: mockStoryIndex, text: () => 'error text' };
        preview.onStoryIndexChanged();
        await waitForRender();
        expect(preview.storyStore.args.get('component-one--a')).toEqual({
          foo: 'url',
        });
      });
    });

    describe('when the current story changes', () => {
      const newComponentOneExports = merge({}, componentOneExports, {
        a: { args: { foo: 'edited' } },
      });
      const newImportFn = jest.fn(async (path) => {
        return path === './src/ComponentOne.stories.js'
          ? newComponentOneExports
          : componentTwoExports;
      });

      it('does not emit STORY_UNCHANGED', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();
        mockChannel.emit.mockClear();

        preview.onStoriesChanged({ importFn: newImportFn });
        await waitForRender();

        expect(mockChannel.emit).not.toHaveBeenCalledWith(
          Events.STORY_UNCHANGED,
          'component-one--a'
        );
      });

      it('does not emit STORY_CHANGED', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();
        mockChannel.emit.mockClear();

        preview.onStoriesChanged({ importFn: newImportFn });
        await waitForRender();

        expect(mockChannel.emit).not.toHaveBeenCalledWith(Events.STORY_CHANGED, 'component-one--a');
      });

      it('emits STORY_PREPARED with new annotations', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();
        mockChannel.emit.mockClear();

        preview.onStoriesChanged({ importFn: newImportFn });
        await waitForRender();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_PREPARED, {
          id: 'component-one--a',
          parameters: {
            __isArgsStory: false,
            docs: { container: expect.any(Function) },
            fileName: './src/ComponentOne.stories.js',
          },
          initialArgs: { foo: 'edited' },
          argTypes: { foo: { name: 'foo', type: { name: 'string' } } },
          args: { foo: 'edited' },
        });
      });

      it('emits STORY_ARGS_UPDATED with new args', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();
        mockChannel.emit.mockClear();

        preview.onStoriesChanged({ importFn: newImportFn });
        await waitForRender();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_ARGS_UPDATED, {
          storyId: 'component-one--a',
          args: { foo: 'edited' },
        });
      });

      it('applies loaders with story context', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        mockChannel.emit.mockClear();
        componentOneExports.default.loaders[0].mockClear();
        preview.onStoriesChanged({ importFn: newImportFn });
        await waitForRender();

        expect(componentOneExports.default.loaders[0]).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'component-one--a',
            parameters: {
              __isArgsStory: false,
              docs: { container: expect.any(Function) },
              fileName: './src/ComponentOne.stories.js',
            },
            initialArgs: { foo: 'edited' },
            argTypes: { foo: { name: 'foo', type: { name: 'string' } } },
            args: { foo: 'edited' },
          })
        );
      });

      it('passes loaded context to renderToDOM', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        mockChannel.emit.mockClear();
        projectAnnotations.renderToDOM.mockClear();
        preview.onStoriesChanged({ importFn: newImportFn });
        await waitForRender();

        expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
          expect.objectContaining({
            forceRemount: true,
            storyContext: expect.objectContaining({
              id: 'component-one--a',
              parameters: {
                __isArgsStory: false,
                docs: { container: expect.any(Function) },
                fileName: './src/ComponentOne.stories.js',
              },
              globals: { a: 'b' },
              initialArgs: { foo: 'edited' },
              argTypes: { foo: { name: 'foo', type: { name: 'string' } } },
              args: { foo: 'edited' },
              loaded: { l: 7 },
            }),
          }),
          undefined // this is coming from view.prepareForStory, not super important
        );
      });

      it('retains the same delta to the args', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        mockChannel.emit.mockClear();
        emitter.emit(Events.UPDATE_STORY_ARGS, {
          storyId: 'component-one--a',
          updatedArgs: { foo: 'updated' },
        });
        await waitForRender();

        mockChannel.emit.mockClear();
        projectAnnotations.renderToDOM.mockClear();
        preview.onStoriesChanged({ importFn: newImportFn });
        await waitForRender();

        expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
          expect.objectContaining({
            forceRemount: true,
            storyContext: expect.objectContaining({
              id: 'component-one--a',
              args: { foo: 'updated' },
            }),
          }),
          undefined // this is coming from view.prepareForStory, not super important
        );
      });

      it('renders exception if renderToDOM throws', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        const error = new Error('error');
        projectAnnotations.renderToDOM.mockImplementationOnce(() => {
          throw error;
        });

        mockChannel.emit.mockClear();
        preview.onStoriesChanged({ importFn: newImportFn });
        await waitForRender();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_THREW_EXCEPTION, error);
        expect(preview.view.showErrorDisplay).toHaveBeenCalledWith(error);
      });

      it('renders error if the story calls showError', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        const error = { title: 'title', description: 'description' };
        projectAnnotations.renderToDOM.mockImplementationOnce((context) =>
          context.showError(error)
        );

        mockChannel.emit.mockClear();
        preview.onStoriesChanged({ importFn: newImportFn });
        await waitForRender();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_ERRORED, error);
        expect(preview.view.showErrorDisplay).toHaveBeenCalledWith({
          message: error.title,
          stack: error.description,
        });
      });

      it('renders exception if the story calls showException', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        const error = new Error('error');
        projectAnnotations.renderToDOM.mockImplementationOnce((context) =>
          context.showException(error)
        );

        mockChannel.emit.mockClear();
        preview.onStoriesChanged({ importFn: newImportFn });
        await waitForRender();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_THREW_EXCEPTION, error);
        expect(preview.view.showErrorDisplay).toHaveBeenCalledWith(error);
      });

      it('executes playFunction', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        mockChannel.emit.mockClear();
        componentOneExports.a.play.mockClear();
        preview.onStoriesChanged({ importFn: newImportFn });
        await waitForRender();

        expect(componentOneExports.a.play).toHaveBeenCalled();
      });

      it('emits STORY_RENDERED', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        mockChannel.emit.mockClear();
        preview.onStoriesChanged({ importFn: newImportFn });
        await waitForRender();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_RENDERED, 'component-one--a');
      });
    });

    describe('when the current story changes importPath', () => {
      const newImportFn = jest.fn(async (path) => ({ ...componentOneExports }));

      const newStoryIndex = {
        v: 3,
        stories: {
          ...storyIndex.stories,
          'component-one--a': {
            ...storyIndex.stories['component-one--a'],
            importPath: './src/ComponentOne-new.stories.js',
          },
        },
      };
      beforeEach(() => {
        newImportFn.mockClear();
      });

      it('re-imports the component', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        mockChannel.emit.mockClear();
        preview.onStoriesChanged({ importFn: newImportFn, storyIndex: newStoryIndex });
        await waitForRender();

        expect(newImportFn).toHaveBeenCalledWith('./src/ComponentOne-new.stories.js');
      });

      describe('if it was previously rendered', () => {
        beforeEach(() => jest.useFakeTimers());
        afterEach(() => jest.useRealTimers());
        it('is reloaded when it is re-selected', async () => {
          document.location.search = '?id=component-one--a';
          const preview = await createAndRenderPreview();

          mockChannel.emit.mockClear();
          emitter.emit(Events.SET_CURRENT_STORY, {
            storyId: 'component-one--b',
            viewMode: 'story',
          });
          await waitForSetCurrentStory();
          await waitForRender();

          preview.onStoriesChanged({ importFn: newImportFn, storyIndex: newStoryIndex });

          mockChannel.emit.mockClear();
          emitter.emit(Events.SET_CURRENT_STORY, {
            storyId: 'component-one--a',
            viewMode: 'story',
          });
          await waitForSetCurrentStory();
          await waitForRender();
          expect(newImportFn).toHaveBeenCalledWith('./src/ComponentOne-new.stories.js');
        });
      });
    });

    describe('when the current story has not changed', () => {
      const newComponentTwoExports = { ...componentTwoExports };
      const newImportFn = jest.fn(async (path) => {
        return path === './src/ComponentOne.stories.js'
          ? componentOneExports
          : newComponentTwoExports;
      });

      it('emits STORY_UNCHANGED', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        mockChannel.emit.mockClear();
        preview.onStoriesChanged({ importFn: newImportFn });
        await waitForEvents([Events.STORY_UNCHANGED]);

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_UNCHANGED, 'component-one--a');
        expect(mockChannel.emit).not.toHaveBeenCalledWith(Events.STORY_CHANGED, 'component-one--a');
      });

      it('clears preparing state', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        (preview.view.showMain as jest.Mock).mockClear();
        mockChannel.emit.mockClear();
        preview.onStoriesChanged({ importFn: newImportFn });
        await waitForEvents([Events.STORY_UNCHANGED]);

        expect(preview.view.showMain).toHaveBeenCalled();
      });

      it('does not re-render the story', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        mockChannel.emit.mockClear();
        projectAnnotations.renderToDOM.mockClear();
        preview.onStoriesChanged({ importFn: newImportFn });
        await waitForQuiescence();

        expect(projectAnnotations.renderToDOM).not.toHaveBeenCalled();
        expect(mockChannel.emit).not.toHaveBeenCalledWith(
          Events.STORY_RENDERED,
          'component-one--a'
        );
      });
    });

    describe('when another (not current) story changes', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });
      afterEach(() => {
        jest.useRealTimers();
      });
      const newComponentOneExports = merge({}, componentOneExports, {
        a: { args: { bar: 'edited' }, argTypes: { bar: { type: { name: 'string' } } } },
      });
      const newImportFn = jest.fn(async (path) => {
        return path === './src/ComponentOne.stories.js'
          ? newComponentOneExports
          : componentTwoExports;
      });
      it('retains the same delta to the args', async () => {
        // Start at Story A
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        // Change A's args
        mockChannel.emit.mockClear();
        emitter.emit(Events.UPDATE_STORY_ARGS, {
          storyId: 'component-one--a',
          updatedArgs: { foo: 'updated' },
        });
        await waitForRender();

        // Change to story B
        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--b',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();
        await waitForRender();
        expect(preview.storyStore.args.get('component-one--a')).toEqual({
          foo: 'updated',
        });

        // Update story A's args via HMR
        mockChannel.emit.mockClear();
        projectAnnotations.renderToDOM.mockClear();
        preview.onStoriesChanged({ importFn: newImportFn });
        await waitForRender();

        // Change back to Story A
        mockChannel.emit.mockClear();
        emitter.emit(Events.SET_CURRENT_STORY, {
          storyId: 'component-one--a',
          viewMode: 'story',
        });
        await waitForSetCurrentStory();
        await waitForRender();
        expect(preview.storyStore.args.get('component-one--a')).toEqual({
          foo: 'updated',
          bar: 'edited',
        });

        expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
          expect.objectContaining({
            forceRemount: true,
            storyContext: expect.objectContaining({
              id: 'component-one--a',
              args: { foo: 'updated', bar: 'edited' },
            }),
          }),
          undefined // this is coming from view.prepareForStory, not super important
        );
      });
    });

    describe('if the story no longer exists', () => {
      const { a, ...componentOneExportsWithoutA } = componentOneExports;
      const newImportFn = jest.fn(async (path) => {
        return path === './src/ComponentOne.stories.js'
          ? componentOneExportsWithoutA
          : componentTwoExports;
      });

      const newStoryIndex = {
        v: 3,
        stories: {
          'component-one--b': storyIndex.stories['component-one--b'],
        },
      };

      it('renders loading error', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        mockChannel.emit.mockClear();
        preview.onStoriesChanged({ importFn: newImportFn, storyIndex: newStoryIndex });
        await waitForEvents([Events.STORY_MISSING]);

        expect(preview.view.showErrorDisplay).toHaveBeenCalled();
        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_MISSING, 'component-one--a');
      });

      it('does not re-render the story', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        mockChannel.emit.mockClear();
        projectAnnotations.renderToDOM.mockClear();
        preview.onStoriesChanged({ importFn: newImportFn, storyIndex: newStoryIndex });
        await waitForQuiescence();

        expect(projectAnnotations.renderToDOM).not.toHaveBeenCalled();
        expect(mockChannel.emit).not.toHaveBeenCalledWith(
          Events.STORY_RENDERED,
          'component-one--a'
        );
      });

      it('re-renders the story if it is readded', async () => {
        document.location.search = '?id=component-one--a';
        const preview = await createAndRenderPreview();

        mockChannel.emit.mockClear();
        preview.onStoriesChanged({ importFn: newImportFn, storyIndex: newStoryIndex });
        await waitForEvents([Events.STORY_MISSING]);

        mockChannel.emit.mockClear();
        preview.onStoriesChanged({ importFn, storyIndex });
        await waitForRender();
        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_RENDERED, 'component-one--a');
      });
    });
  });

  describe('onGetProjectAnnotationsChanged', () => {
    describe('if initial getProjectAnnotations threw', () => {
      it('recovers and renders the story', async () => {
        document.location.search = '?id=component-one--a';

        const err = new Error('meta error');
        const preview = new PreviewWeb();
        await expect(
          preview.initialize({
            importFn,
            getProjectAnnotations: () => {
              throw err;
            },
          })
        ).rejects.toThrow(err);

        preview.onGetProjectAnnotationsChanged({ getProjectAnnotations });
        await waitForRender();

        expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_RENDERED, 'component-one--a');
      });

      it('sets globals from the URL', async () => {
        document.location.search = '?id=*&globals=a:c';

        const err = new Error('meta error');
        const preview = new PreviewWeb();
        await expect(
          preview.initialize({
            importFn,
            getProjectAnnotations: () => {
              throw err;
            },
          })
        ).rejects.toThrow(err);

        preview.onGetProjectAnnotationsChanged({ getProjectAnnotations });
        await waitForRender();

        expect(preview.storyStore.globals.get()).toEqual({ a: 'c' });
      });
    });

    it('shows an error the new value throws', async () => {
      document.location.search = '?id=component-one--a';
      const preview = await createAndRenderPreview();

      mockChannel.emit.mockClear();
      const err = new Error('error getting meta');
      await expect(
        preview.onGetProjectAnnotationsChanged({
          getProjectAnnotations: () => {
            throw err;
          },
        })
      ).rejects.toThrow(err);

      expect(preview.view.showErrorDisplay).toHaveBeenCalled();
      expect(mockChannel.emit).toHaveBeenCalledWith(Events.CONFIG_ERROR, err);
    });

    const newGlobalDecorator = jest.fn((s) => s());
    const newGetProjectAnnotations = () => {
      return {
        ...projectAnnotations,
        args: { global: 'added' },
        globals: { a: 'edited' },
        decorators: [newGlobalDecorator],
      };
    };

    it('updates globals to their new values', async () => {
      document.location.search = '?id=component-one--a';
      const preview = await createAndRenderPreview();

      mockChannel.emit.mockClear();
      preview.onGetProjectAnnotationsChanged({ getProjectAnnotations: newGetProjectAnnotations });
      await waitForRender();

      expect(preview.storyStore.globals.get()).toEqual({ a: 'edited' });
    });

    it('emits SET_GLOBALS with new values', async () => {
      document.location.search = '?id=component-one--a';
      const preview = await createAndRenderPreview();

      mockChannel.emit.mockClear();
      preview.onGetProjectAnnotationsChanged({ getProjectAnnotations: newGetProjectAnnotations });
      await waitForRender();

      await waitForEvents([Events.SET_GLOBALS]);
      expect(mockChannel.emit).toHaveBeenCalledWith(Events.SET_GLOBALS, {
        globals: { a: 'edited' },
        globalTypes: {},
      });
    });

    it('updates args to their new values', async () => {
      document.location.search = '?id=component-one--a';
      const preview = await createAndRenderPreview();

      mockChannel.emit.mockClear();
      preview.onGetProjectAnnotationsChanged({ getProjectAnnotations: newGetProjectAnnotations });
      await waitForRender();

      expect(preview.storyStore.args.get('component-one--a')).toEqual({
        foo: 'a',
        global: 'added',
      });
    });

    it('emits SET_STORY_ARGS with new values', async () => {
      document.location.search = '?id=component-one--a';
      const preview = await createAndRenderPreview();

      mockChannel.emit.mockClear();
      preview.onGetProjectAnnotationsChanged({ getProjectAnnotations: newGetProjectAnnotations });
      await waitForRender();

      expect(mockChannel.emit).toHaveBeenCalledWith(Events.STORY_ARGS_UPDATED, {
        storyId: 'component-one--a',
        args: { foo: 'a', global: 'added' },
      });
    });

    it('rerenders the current story with new global meta-generated context', async () => {
      document.location.search = '?id=component-one--a';
      const preview = await createAndRenderPreview();

      projectAnnotations.renderToDOM.mockClear();
      mockChannel.emit.mockClear();
      preview.onGetProjectAnnotationsChanged({ getProjectAnnotations: newGetProjectAnnotations });
      await waitForRender();

      expect(projectAnnotations.renderToDOM).toHaveBeenCalledWith(
        expect.objectContaining({
          storyContext: expect.objectContaining({
            args: { foo: 'a', global: 'added' },
            globals: { a: 'edited' },
          }),
        }),
        undefined // this is coming from view.prepareForStory, not super important
      );
    });
  });

  describe('onKeydown', () => {
    it('emits PREVIEW_KEYDOWN for regular elements', async () => {
      document.location.search = '?id=component-one--a&viewMode=docs';
      const preview = await createAndRenderPreview();

      preview.onKeydown({
        target: { tagName: 'div', getAttribute: jest.fn().mockReturnValue(null) },
      } as any);

      expect(mockChannel.emit).toHaveBeenCalledWith(
        Events.PREVIEW_KEYDOWN,
        expect.objectContaining({})
      );
    });

    it('does not emit PREVIEW_KEYDOWN for input elements', async () => {
      document.location.search = '?id=component-one--a&viewMode=docs';
      const preview = await createAndRenderPreview();

      preview.onKeydown({
        target: { tagName: 'input', getAttribute: jest.fn().mockReturnValue(null) },
      } as any);

      expect(mockChannel.emit).not.toHaveBeenCalledWith(
        Events.PREVIEW_KEYDOWN,
        expect.objectContaining({})
      );
    });
  });

  describe('extract', () => {
    // NOTE: if you are using storyStoreV6, and your `preview.js` throws, we do not currently
    // detect it (as we do not wrap the import of `preview.js` in a `try/catch`). The net effect
    // of that is that the `PreviewWeb`/`StoryStore` end up in an uninitalized state.
    it('throws an error if the preview is uninitialized', async () => {
      const preview = new PreviewWeb();
      await expect(preview.extract()).rejects.toThrow(/Failed to initialize/);
    });

    it('throws an error if preview.js throws', async () => {
      const err = new Error('meta error');
      const preview = new PreviewWeb();
      await expect(
        preview.initialize({
          importFn,
          getProjectAnnotations: () => {
            throw err;
          },
        })
      ).rejects.toThrow(err);

      await expect(preview.extract()).rejects.toThrow(err);
    });

    it('shows an error if the stories.json endpoint 500s', async () => {
      const err = new Error('sort error');
      mockFetchResult = { status: 500, text: async () => err.toString() };

      const preview = new PreviewWeb();
      await expect(preview.initialize({ importFn, getProjectAnnotations })).rejects.toThrow(
        'sort error'
      );

      await expect(preview.extract()).rejects.toThrow('sort error');
    });

    it('waits for stories to be cached', async () => {
      const [gate, openGate] = createGate();

      const gatedImportFn = async (path) => {
        await gate;
        return importFn(path);
      };

      const preview = await createAndRenderPreview({ importFn: gatedImportFn });

      let extracted = false;
      preview.extract().then(() => {
        extracted = true;
      });

      expect(extracted).toBe(false);

      openGate();
      await new Promise((r) => setTimeout(r, 0)); // Let the promise resolve
      expect(extracted).toBe(true);

      expect(await preview.extract()).toMatchInlineSnapshot(`
        Object {
          "component-one--a": Object {
            "argTypes": Object {
              "foo": Object {
                "name": "foo",
                "type": Object {
                  "name": "string",
                },
              },
            },
            "args": Object {
              "foo": "a",
            },
            "component": undefined,
            "componentId": "component-one",
            "id": "component-one--a",
            "initialArgs": Object {
              "foo": "a",
            },
            "kind": "Component One",
            "name": "A",
            "parameters": Object {
              "__isArgsStory": false,
              "docs": Object {
                "container": [MockFunction],
              },
              "fileName": "./src/ComponentOne.stories.js",
            },
            "story": "A",
            "subcomponents": undefined,
            "title": "Component One",
          },
          "component-one--b": Object {
            "argTypes": Object {
              "foo": Object {
                "name": "foo",
                "type": Object {
                  "name": "string",
                },
              },
            },
            "args": Object {
              "foo": "b",
            },
            "component": undefined,
            "componentId": "component-one",
            "id": "component-one--b",
            "initialArgs": Object {
              "foo": "b",
            },
            "kind": "Component One",
            "name": "B",
            "parameters": Object {
              "__isArgsStory": false,
              "docs": Object {
                "container": [MockFunction],
              },
              "fileName": "./src/ComponentOne.stories.js",
            },
            "story": "B",
            "subcomponents": undefined,
            "title": "Component One",
          },
          "component-two--c": Object {
            "argTypes": Object {
              "foo": Object {
                "name": "foo",
                "type": Object {
                  "name": "string",
                },
              },
            },
            "args": Object {
              "foo": "c",
            },
            "component": undefined,
            "componentId": "component-two",
            "id": "component-two--c",
            "initialArgs": Object {
              "foo": "c",
            },
            "kind": "Component Two",
            "name": "C",
            "parameters": Object {
              "__isArgsStory": false,
              "fileName": "./src/ComponentTwo.stories.js",
            },
            "playFunction": undefined,
            "story": "C",
            "subcomponents": undefined,
            "title": "Component Two",
          },
        }
      `);
    });
  });
});
