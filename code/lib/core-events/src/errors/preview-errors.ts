import dedent from 'ts-dedent';
import { StorybookError } from './storybook-error';

/**
 * If you can't find a suitable category for your error, create one
 * based on the package name/file path of which the error is thrown.
 * For instance:
 * If it's from @storybook/client-logger, then CLIENT-LOGGER
 *
 * Categories are prefixed by a logical grouping, e.g. PREVIEW_ or FRAMEWORK_
 * to prevent manager and preview errors from having the same category and error code.
 */
export enum Category {
  PREVIEW_CLIENT_LOGGER = 'PREVIEW_CLIENT-LOGGER',
  PREVIEW_CHANNELS = 'PREVIEW_CHANNELS',
  PREVIEW_CORE_EVENTS = 'PREVIEW_CORE-EVENTS',
  PREVIEW_INSTRUMENTER = 'PREVIEW_INSTRUMENTER',
  PREVIEW_API = 'PREVIEW_API',
  PREVIEW_REACT_DOM_SHIM = 'PREVIEW_REACT-DOM-SHIM',
  PREVIEW_ROUTER = 'PREVIEW_ROUTER',
  PREVIEW_THEMING = 'PREVIEW_THEMING',
  RENDERER_HTML = 'RENDERER_HTML',
  RENDERER_PREACT = 'RENDERER_PREACT',
  RENDERER_REACT = 'RENDERER_REACT',
  RENDERER_SERVER = 'RENDERER_SERVER',
  RENDERER_SVELTE = 'RENDERER_SVELTE',
  RENDERER_VUE = 'RENDERER_VUE',
  RENDERER_VUE3 = 'RENDERER_VUE3',
  RENDERER_WEB_COMPONENTS = 'RENDERER_WEB-COMPONENTS',
}

export class MissingStoryAfterHmrError extends StorybookError {
  readonly category = Category.PREVIEW_API;

  readonly code = 1;

  constructor(public data: { storyId: string }) {
    super();
  }

  template() {
    return dedent`
    Couldn't find story matching id '${this.data.storyId}' after HMR.
    - Did you just rename a story?
    - Did you remove it from your CSF file?
    - Are you sure a story with the id '${this.data.storyId}' exists?
    - Please check the values in the stories field of your main.js config and see if they would match your CSF File.
    - Also check the browser console and terminal for potential error messages.`;
  }
}

export class ImplicitActionsDuringRendering extends StorybookError {
  readonly category = Category.PREVIEW_API;

  readonly code = 2;

  readonly documentation =
    'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#using-implicit-actions-during-rendering-is-deprecated-for-example-in-the-play-function';

  constructor(public data: { phase: string; name: string; deprecated: boolean }) {
    super();
  }

  template() {
    return dedent`
      We detected that you use an implicit action arg while ${this.data.phase} of your story.  
      ${this.data.deprecated ? `\nThis is deprecated and won't work in Storybook 8 anymore.\n` : ``}
      Please provide an explicit spy to your args like this:
        import { fn } from '@storybook/test';
        ... 
        args: {
         ${this.data.name}: fn()
        }
    `;
  }
}

export class CalledExtractOnStoreError extends StorybookError {
  readonly category = Category.PREVIEW_API;

  readonly code = 3;

  template() {
    return dedent`
    Cannot call \`storyStore.extract()\` without calling \`storyStore.cacheAllCsfFiles()\` first.

    You probably meant to call \`await preview.extract()\` which does the above for you.`;
  }
}

export class MissingRenderToCanvasError extends StorybookError {
  readonly category = Category.PREVIEW_API;

  readonly code = 4;

  readonly documentation =
    'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#mainjs-framework-field';

  template() {
    return dedent`
      Expected your framework's preset to export a \`renderToCanvas\` field.

      Perhaps it needs to be upgraded for Storybook 6.4?`;
  }
}

export class CalledPreviewMethodBeforeInitializationError extends StorybookError {
  readonly category = Category.PREVIEW_API;

  readonly code = 5;

  constructor(public data: { methodName: string }) {
    super();
  }

  template() {
    return dedent`
      Called \`Preview.${this.data.methodName}()\` before initialization.
      
      The preview needs to load the story index before most methods can be called. If you want
      to call \`${this.data.methodName}\`, try \`await preview.initializationPromise;\` first.
      
      If you didn't call the above code, then likely it was called by an addon that needs to
      do the above.`;
  }
}

export class StoryIndexFetchError extends StorybookError {
  readonly category = Category.PREVIEW_API;

  readonly code = 6;

  constructor(public data: { text: string }) {
    super();
  }

  template() {
    return dedent`
      Error fetching \`/index.json\`:
      
      ${this.data.text}

      If you are in development, this likely indicates a problem with your Storybook process,
      check the terminal for errors.

      If you are in a deployed Storybook, there may have been an issue deploying the full Storybook
      build.`;
  }
}

export class MdxFileWithNoCsfReferencesError extends StorybookError {
  readonly category = Category.PREVIEW_API;

  readonly code = 7;

  constructor(public data: { storyId: string }) {
    super();
  }

  template() {
    return dedent`
      Tried to render docs entry ${this.data.storyId} but it is a MDX file that has no CSF
      references, or autodocs for a CSF file that some doesn't refer to itself.
      
      This likely is an internal error in Storybook's indexing, or you've attached the
      \`attached-mdx\` tag to an MDX file that is not attached.`;
  }
}

export class EmptyIndexError extends StorybookError {
  readonly category = Category.PREVIEW_API;

  readonly code = 8;

  template() {
    return dedent`
      Couldn't find any stories in your Storybook.

        - Please check your stories field of your main.js config: does it match correctly?
        - Also check the browser console and terminal for error messages.`;
  }
}

export class NoStoryMatchError extends StorybookError {
  readonly category = Category.PREVIEW_API;

  readonly code = 9;

  constructor(public data: { storySpecifier: string }) {
    super();
  }

  template() {
    return dedent`
      Couldn't find story matching '${this.data.storySpecifier}'.

        - Are you sure a story with that id exists?
        - Please check your stories field of your main.js config.
        - Also check the browser console and terminal for error messages.`;
  }
}

export class MissingStoryFromCsfFileError extends StorybookError {
  readonly category = Category.PREVIEW_API;

  readonly code = 10;

  constructor(public data: { storyId: string }) {
    super();
  }

  template() {
    return dedent`
    Couldn't find story matching id '${this.data.storyId}' after importing a CSF file.

    The file was indexed as if the story was there, but then after importing the file in the browser
    we didn't find the story. Possible reasons:
    - You are using a custom story indexer that is misbehaving.
    - You have a custom file loader that is removing or renaming exports.

    Please check your browser console and terminal for errors that may explain the issue.`;
  }
}

export class StoryStoreAccessedBeforeInitializationError extends StorybookError {
  readonly category = Category.PREVIEW_API;

  readonly code = 11;

  template() {
    return dedent`
    Cannot access the Story Store until the index is ready.

    It is not recommended to use methods directly on the Story Store anyway, in Storybook 9 we will
    remove access to the store entirely`;
  }
}
