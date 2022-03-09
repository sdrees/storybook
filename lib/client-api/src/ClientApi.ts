import deprecate from 'util-deprecate';
import dedent from 'ts-dedent';
import global from 'global';
import { logger } from '@storybook/client-logger';
import { toId, sanitize } from '@storybook/csf';
import type {
  Args,
  ArgTypes,
  AnyFramework,
  DecoratorFunction,
  Parameters,
  ArgTypesEnhancer,
  ArgsEnhancer,
  LoaderFunction,
  StoryFn,
  ComponentTitle,
  Globals,
  GlobalTypes,
  LegacyStoryFn,
} from '@storybook/csf';
import { combineParameters, StoryStore, normalizeInputTypes } from '@storybook/store';
import type { NormalizedComponentAnnotations, Path, ModuleImportFn } from '@storybook/store';
import type { ClientApiAddons, StoryApi } from '@storybook/addons';

import { StoryStoreFacade } from './StoryStoreFacade';

export interface GetStorybookStory<TFramework extends AnyFramework> {
  name: string;
  render: LegacyStoryFn<TFramework>;
}

export interface GetStorybookKind<TFramework extends AnyFramework> {
  kind: string;
  fileName: string;
  stories: GetStorybookStory<TFramework>[];
}

// ClientApi (and StoreStore) are really singletons. However they are not created until the
// relevant framework instanciates them via `start.js`. The good news is this happens right away.
let singleton: ClientApi<AnyFramework>;

const warningAlternatives = {
  addDecorator: `Instead, use \`export const decorators = [];\` in your \`preview.js\`.`,
  addParameters: `Instead, use \`export const parameters = {};\` in your \`preview.js\`.`,
  addLoaders: `Instead, use \`export const loaders = [];\` in your \`preview.js\`.`,
};

const warningMessage = (method: keyof typeof warningAlternatives) =>
  deprecate(
    () => {},
    dedent`
  \`${method}\` is deprecated, and will be removed in Storybook 7.0.

  ${warningAlternatives[method]}

  Read more at https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-addparameters-and-adddecorator).`
  );

const warnings = {
  addDecorator: warningMessage('addDecorator'),
  addParameters: warningMessage('addParameters'),
  addLoaders: warningMessage('addLoaders'),
};

const checkMethod = (method: string, deprecationWarning: boolean) => {
  if (global.FEATURES?.storyStoreV7) {
    throw new Error(
      dedent`You cannot use \`${method}\` with the new Story Store.
      
      ${warningAlternatives[method as keyof typeof warningAlternatives]}`
    );
  }

  if (!singleton) {
    throw new Error(`Singleton client API not yet initialized, cannot call \`${method}\`.`);
  }

  if (deprecationWarning) {
    warnings[method as keyof typeof warningAlternatives]();
  }
};

export const addDecorator = (
  decorator: DecoratorFunction<AnyFramework>,
  deprecationWarning = true
) => {
  checkMethod('addDecorator', deprecationWarning);
  singleton.addDecorator(decorator);
};

export const addParameters = (parameters: Parameters, deprecationWarning = true) => {
  checkMethod('addParameters', deprecationWarning);
  singleton.addParameters(parameters);
};

export const addLoader = (loader: LoaderFunction<AnyFramework>, deprecationWarning = true) => {
  checkMethod('addLoader', deprecationWarning);
  singleton.addLoader(loader);
};

export const addArgs = (args: Args) => {
  checkMethod('addArgs', false);
  singleton.addArgs(args);
};

export const addArgTypes = (argTypes: ArgTypes) => {
  checkMethod('addArgTypes', false);
  singleton.addArgTypes(argTypes);
};

export const addArgsEnhancer = (enhancer: ArgsEnhancer<AnyFramework>) => {
  checkMethod('addArgsEnhancer', false);
  singleton.addArgsEnhancer(enhancer);
};

export const addArgTypesEnhancer = (enhancer: ArgTypesEnhancer<AnyFramework>) => {
  checkMethod('addArgTypesEnhancer', false);
  singleton.addArgTypesEnhancer(enhancer);
};

export const getGlobalRender = () => {
  checkMethod('getGlobalRender', false);
  return singleton.facade.projectAnnotations.render;
};

export const setGlobalRender = (render: StoryFn<AnyFramework>) => {
  checkMethod('setGlobalRender', false);
  singleton.facade.projectAnnotations.render = render;
};

const invalidStoryTypes = new Set(['string', 'number', 'boolean', 'symbol']);
export class ClientApi<TFramework extends AnyFramework> {
  facade: StoryStoreFacade<TFramework>;

  storyStore?: StoryStore<TFramework>;

  private addons: ClientApiAddons<TFramework['storyResult']>;

  onImportFnChanged?: ({ importFn }: { importFn: ModuleImportFn }) => void;

  // If we don't get passed modules so don't know filenames, we can
  // just use numeric indexes
  private lastFileName = 0;

  constructor({ storyStore }: { storyStore?: StoryStore<TFramework> } = {}) {
    this.facade = new StoryStoreFacade();

    this.addons = {};

    this.storyStore = storyStore;

    singleton = this;
  }

  importFn(path: Path) {
    return this.facade.importFn(path);
  }

  getStoryIndex() {
    if (!this.storyStore) {
      throw new Error('Cannot get story index before setting storyStore');
    }
    return this.facade.getStoryIndex(this.storyStore);
  }

  setAddon = deprecate(
    (addon: any) => {
      this.addons = { ...this.addons, ...addon };
    },
    dedent`
      \`setAddon\` is deprecated and will be removed in Storybook 7.0.

      https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-setaddon
    `
  );

  addDecorator = (decorator: DecoratorFunction<TFramework>) => {
    this.facade.projectAnnotations.decorators.push(decorator);
  };

  clearDecorators = deprecate(
    () => {
      this.facade.projectAnnotations.decorators = [];
    },
    dedent`
      \`clearDecorators\` is deprecated and will be removed in Storybook 7.0.

      https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-cleardecorators
    `
  );

  addParameters = ({
    globals,
    globalTypes,
    ...parameters
  }: Parameters & { globals?: Globals; globalTypes?: GlobalTypes }) => {
    this.facade.projectAnnotations.parameters = combineParameters(
      this.facade.projectAnnotations.parameters,
      parameters
    );
    if (globals) {
      this.facade.projectAnnotations.globals = {
        ...this.facade.projectAnnotations.globals,
        ...globals,
      };
    }
    if (globalTypes) {
      this.facade.projectAnnotations.globalTypes = {
        ...this.facade.projectAnnotations.globalTypes,
        ...normalizeInputTypes(globalTypes),
      };
    }
  };

  addLoader = (loader: LoaderFunction<TFramework>) => {
    this.facade.projectAnnotations.loaders.push(loader);
  };

  addArgs = (args: Args) => {
    this.facade.projectAnnotations.args = {
      ...this.facade.projectAnnotations.args,
      ...args,
    };
  };

  addArgTypes = (argTypes: ArgTypes) => {
    this.facade.projectAnnotations.argTypes = {
      ...this.facade.projectAnnotations.argTypes,
      ...normalizeInputTypes(argTypes),
    };
  };

  addArgsEnhancer = (enhancer: ArgsEnhancer<TFramework>) => {
    this.facade.projectAnnotations.argsEnhancers.push(enhancer);
  };

  addArgTypesEnhancer = (enhancer: ArgTypesEnhancer<TFramework>) => {
    this.facade.projectAnnotations.argTypesEnhancers.push(enhancer);
  };

  // what are the occasions that "m" is a boolean vs an obj
  storiesOf = (kind: string, m?: NodeModule): StoryApi<TFramework['storyResult']> => {
    if (!kind && typeof kind !== 'string') {
      throw new Error('Invalid or missing kind provided for stories, should be a string');
    }

    if (!m) {
      logger.warn(
        `Missing 'module' parameter for story with a kind of '${kind}'. It will break your HMR`
      );
    }

    if (m) {
      const proto = Object.getPrototypeOf(m);
      if (proto.exports && proto.exports.default) {
        // FIXME: throw an error in SB6.0
        logger.error(
          `Illegal mix of CSF default export and storiesOf calls in a single file: ${proto.i}`
        );
      }
    }

    // eslint-disable-next-line no-plusplus
    const baseFilename = m && m.id ? `${m.id}` : (this.lastFileName++).toString();
    let fileName = baseFilename;
    let i = 1;
    // Deal with `storiesOf()` being called twice in the same file.
    // On HMR, `this.csfExports[fileName]` will be reset to `{}`, so an empty object is due
    // to this export, not a second call of `storiesOf()`.
    while (
      this.facade.csfExports[fileName] &&
      Object.keys(this.facade.csfExports[fileName]).length > 0
    ) {
      i += 1;
      fileName = `${baseFilename}-${i}`;
    }

    if (m && m.hot && m.hot.accept) {
      // This module used storiesOf(), so when it re-runs on HMR, it will reload
      // itself automatically without us needing to look at our imports
      m.hot.accept();
      m.hot.dispose(() => {
        this.facade.clearFilenameExports(fileName);

        // We need to update the importFn as soon as the module re-evaluates
        // (and calls storiesOf() again, etc). We could call `onImportFnChanged()`
        // at the end of every setStories call (somehow), but then we'd need to
        // debounce it somehow for initial startup. Instead, we'll take advantage of
        // the fact that the evaluation of the module happens immediately in the same tick
        setTimeout(() => {
          this.onImportFnChanged?.({ importFn: this.importFn.bind(this) });
        }, 0);
      });
    }

    let hasAdded = false;
    const api: StoryApi<TFramework['storyResult']> = {
      kind: kind.toString(),
      add: () => api,
      addDecorator: () => api,
      addLoader: () => api,
      addParameters: () => api,
    };

    // apply addons
    Object.keys(this.addons).forEach((name) => {
      const addon = this.addons[name];
      api[name] = (...args: any[]) => {
        addon.apply(api, args);
        return api;
      };
    });

    const meta: NormalizedComponentAnnotations<TFramework> = {
      id: sanitize(kind),
      title: kind,
      decorators: [],
      loaders: [],
      parameters: {},
    };
    // We map these back to a simple default export, even though we have type guarantees at this point
    this.facade.csfExports[fileName] = { default: meta };

    let counter = 0;
    api.add = (storyName: string, storyFn: StoryFn<TFramework>, parameters: Parameters = {}) => {
      hasAdded = true;

      if (typeof storyName !== 'string') {
        throw new Error(`Invalid or missing storyName provided for a "${kind}" story.`);
      }

      if (!storyFn || Array.isArray(storyFn) || invalidStoryTypes.has(typeof storyFn)) {
        throw new Error(
          `Cannot load story "${storyName}" in "${kind}" due to invalid format. Storybook expected a function/object but received ${typeof storyFn} instead.`
        );
      }

      const { decorators, loaders, component, args, argTypes, ...storyParameters } = parameters;

      // eslint-disable-next-line no-underscore-dangle
      const storyId = parameters.__id || toId(kind, storyName);

      const csfExports = this.facade.csfExports[fileName];
      // Whack a _ on the front incase it is "default"
      csfExports[`story${counter}`] = {
        name: storyName,
        parameters: { fileName, __id: storyId, ...storyParameters },
        decorators,
        loaders,
        args,
        argTypes,
        component,
        render: storyFn,
      };
      counter += 1;

      this.facade.stories[storyId] = {
        id: storyId,
        title: csfExports.default.title,
        name: storyName,
        importPath: fileName,
      };

      return api;
    };

    api.addDecorator = (decorator: DecoratorFunction<TFramework>) => {
      if (hasAdded)
        throw new Error(`You cannot add a decorator after the first story for a kind.
Read more here: https://github.com/storybookjs/storybook/blob/master/MIGRATION.md#can-no-longer-add-decoratorsparameters-after-stories`);

      meta.decorators.push(decorator);
      return api;
    };

    api.addLoader = (loader: LoaderFunction<TFramework>) => {
      if (hasAdded) throw new Error(`You cannot add a loader after the first story for a kind.`);

      meta.loaders.push(loader);
      return api;
    };

    api.addParameters = ({ component, args, argTypes, ...parameters }: Parameters) => {
      if (hasAdded)
        throw new Error(`You cannot add parameters after the first story for a kind.
Read more here: https://github.com/storybookjs/storybook/blob/master/MIGRATION.md#can-no-longer-add-decoratorsparameters-after-stories`);

      meta.parameters = combineParameters(meta.parameters, parameters);
      if (component) meta.component = component;
      if (args) meta.args = { ...meta.args, ...args };
      if (argTypes) meta.argTypes = { ...meta.argTypes, ...argTypes };
      return api;
    };

    return api;
  };

  getStorybook = (): GetStorybookKind<TFramework>[] => {
    const { stories } = this.storyStore.storyIndex;

    const kinds: Record<ComponentTitle, GetStorybookKind<TFramework>> = {};
    Object.entries(stories).forEach(([storyId, { title, name, importPath }]) => {
      if (!kinds[title]) {
        kinds[title] = { kind: title, fileName: importPath, stories: [] };
      }

      const { storyFn } = this.storyStore.fromId(storyId);

      kinds[title].stories.push({ name, render: storyFn });
    });

    return Object.values(kinds);
  };

  // @deprecated
  raw = () => {
    return this.storyStore.raw();
  };

  // @deprecated
  get _storyStore() {
    return this.storyStore;
  }
}
