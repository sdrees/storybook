/* eslint-disable no-underscore-dangle */

import { dedent } from 'ts-dedent';
import { global } from '@storybook/global';
import type {
  Args,
  StepRunner,
  ArgTypes,
  Renderer,
  DecoratorFunction,
  Parameters,
  ArgTypesEnhancer,
  ArgsEnhancer,
  LoaderFunction,
  Globals,
  GlobalTypes,
  Path,
  ModuleImportFn,
  ModuleExports,
} from '@storybook/types';
import type { StoryStore } from '../../store';
import { combineParameters, composeStepRunners, normalizeInputTypes } from '../../store';

import { StoryStoreFacade } from './StoryStoreFacade';

const warningAlternatives = {
  addDecorator: `Instead, use \`export const decorators = [];\` in your \`preview.js\`.`,
  addParameters: `Instead, use \`export const parameters = {};\` in your \`preview.js\`.`,
  addLoader: `Instead, use \`export const loaders = [];\` in your \`preview.js\`.`,
  addArgs: '',
  addArgTypes: '',
  addArgsEnhancer: '',
  addArgTypesEnhancer: '',
  addStepRunner: '',
  getGlobalRender: '',
  setGlobalRender: '',
};

const checkMethod = (method: keyof typeof warningAlternatives) => {
  if (global.FEATURES?.storyStoreV7) {
    throw new Error(
      dedent`You cannot use \`${method}\` with the new Story Store.

      ${warningAlternatives[method]}`
    );
  }

  if (!global.__STORYBOOK_CLIENT_API__) {
    throw new Error(`Singleton client API not yet initialized, cannot call \`${method}\`.`);
  }
};

export const addDecorator = (decorator: DecoratorFunction<Renderer>) => {
  checkMethod('addDecorator');
  global.__STORYBOOK_CLIENT_API__?.addDecorator(decorator);
};

export const addParameters = (parameters: Parameters) => {
  checkMethod('addParameters');
  global.__STORYBOOK_CLIENT_API__?.addParameters(parameters);
};

export const addLoader = (loader: LoaderFunction<Renderer>) => {
  checkMethod('addLoader');
  global.__STORYBOOK_CLIENT_API__?.addLoader(loader);
};

export const addArgs = (args: Args) => {
  checkMethod('addArgs');
  global.__STORYBOOK_CLIENT_API__?.addArgs(args);
};

export const addArgTypes = (argTypes: ArgTypes) => {
  checkMethod('addArgTypes');
  global.__STORYBOOK_CLIENT_API__?.addArgTypes(argTypes);
};

export const addArgsEnhancer = (enhancer: ArgsEnhancer<Renderer>) => {
  checkMethod('addArgsEnhancer');
  global.__STORYBOOK_CLIENT_API__?.addArgsEnhancer(enhancer);
};

export const addArgTypesEnhancer = (enhancer: ArgTypesEnhancer<Renderer>) => {
  checkMethod('addArgTypesEnhancer');
  global.__STORYBOOK_CLIENT_API__?.addArgTypesEnhancer(enhancer);
};

export const addStepRunner = (stepRunner: StepRunner) => {
  checkMethod('addStepRunner');
  global.__STORYBOOK_CLIENT_API__?.addStepRunner(stepRunner);
};

export const getGlobalRender = () => {
  checkMethod('getGlobalRender');
  return global.__STORYBOOK_CLIENT_API__?.facade.projectAnnotations.render;
};

export const setGlobalRender = (render: StoryStoreFacade<any>['projectAnnotations']['render']) => {
  checkMethod('setGlobalRender');
  if (global.__STORYBOOK_CLIENT_API__) {
    global.__STORYBOOK_CLIENT_API__.facade.projectAnnotations.render = render;
  }
};

export class ClientApi<TRenderer extends Renderer> {
  facade: StoryStoreFacade<TRenderer>;

  storyStore?: StoryStore<TRenderer>;

  onImportFnChanged?: ({ importFn }: { importFn: ModuleImportFn }) => void;

  // If we don't get passed modules so don't know filenames, we can
  // just use numeric indexes

  constructor({ storyStore }: { storyStore?: StoryStore<TRenderer> } = {}) {
    this.facade = new StoryStoreFacade();

    this.storyStore = storyStore;
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

  addDecorator = (decorator: DecoratorFunction<TRenderer>) => {
    this.facade.projectAnnotations.decorators?.push(decorator);
  };

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

  addStepRunner = (stepRunner: StepRunner<TRenderer>) => {
    this.facade.projectAnnotations.runStep = composeStepRunners(
      [this.facade.projectAnnotations.runStep, stepRunner].filter(
        Boolean
      ) as StepRunner<TRenderer>[]
    );
  };

  addLoader = (loader: LoaderFunction<TRenderer>) => {
    this.facade.projectAnnotations.loaders?.push(loader);
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

  addArgsEnhancer = (enhancer: ArgsEnhancer<TRenderer>) => {
    this.facade.projectAnnotations.argsEnhancers?.push(enhancer);
  };

  addArgTypesEnhancer = (enhancer: ArgTypesEnhancer<TRenderer>) => {
    this.facade.projectAnnotations.argTypesEnhancers?.push(enhancer);
  };

  // Because of the API of `storiesOf().add()` we don't have a good "end" call for a
  // storiesOf file to finish adding stories, and us to load it into the facade as a
  // single psuedo-CSF file. So instead we just keep collecting the CSF files and load
  // them all into the facade at the end.
  _addedExports = {} as Record<Path, ModuleExports>;

  _loadAddedExports() {
    Object.entries(this._addedExports).forEach(([fileName, fileExports]) =>
      this.facade.addStoriesFromExports(fileName, fileExports)
    );
  }

  // @deprecated
  raw = () => {
    return this.storyStore?.raw();
  };

  // @deprecated
  get _storyStore() {
    return this.storyStore;
  }
}
