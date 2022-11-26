/* eslint-disable import/no-unresolved */
import {
  addDecorator,
  addParameters,
  addLoader,
  addArgs,
  addArgTypes,
  addStepRunner,
  addArgsEnhancer,
  addArgTypesEnhancer,
  setGlobalRender,
} from '{{previewApi}}';
import * as previewAnnotations from '{{previewAnnotationFilename}}';

Object.keys(previewAnnotations).forEach((key) => {
  const value = previewAnnotations[key];
  switch (key) {
    case 'args': {
      return addArgs(value);
    }
    case 'argTypes': {
      return addArgTypes(value);
    }
    case 'decorators': {
      return value.forEach((decorator) => addDecorator(decorator, false));
    }
    case 'loaders': {
      return value.forEach((loader) => addLoader(loader, false));
    }
    case 'parameters': {
      return addParameters({ ...value }, false);
    }
    case 'argTypesEnhancers': {
      return value.forEach((enhancer) => addArgTypesEnhancer(enhancer));
    }
    case 'argsEnhancers': {
      return value.forEach((enhancer) => addArgsEnhancer(enhancer));
    }
    case 'render': {
      return setGlobalRender(value);
    }
    case 'globals':
    case 'globalTypes': {
      const v = {};
      v[key] = value;
      return addParameters(v, false);
    }
    case '__namedExportsOrder':
    case 'decorateStory':
    case 'renderToDOM': // deprecated
    case 'renderToCanvas': {
      return null; // This key is not handled directly in v6 mode.
    }
    case 'runStep': {
      return addStepRunner(value);
    }
    default: {
      return console.log(
        `Unknown key '${key}' exported by preview annotation file '{{previewAnnotationFilename}}'`
      );
    }
  }
});
