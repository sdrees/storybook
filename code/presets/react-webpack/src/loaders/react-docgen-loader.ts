import {
  parse,
  builtinResolvers as docgenResolver,
  builtinHandlers as docgenHandlers,
  builtinImporters as docgenImporters,
  ERROR_CODES,
  utils,
} from 'react-docgen';
import MagicString from 'magic-string';
import type { LoaderContext } from 'webpack';
import type { Handler, NodePath, babelTypes as t, Documentation } from 'react-docgen';

const { getNameOrValue, isReactForwardRefCall } = utils;

const actualNameHandler: Handler = function actualNameHandler(documentation, componentDefinition) {
  if (
    (componentDefinition.isClassDeclaration() || componentDefinition.isFunctionDeclaration()) &&
    componentDefinition.has('id')
  ) {
    documentation.set(
      'actualName',
      getNameOrValue(componentDefinition.get('id') as NodePath<t.Identifier>)
    );
  } else if (
    componentDefinition.isArrowFunctionExpression() ||
    componentDefinition.isFunctionExpression() ||
    isReactForwardRefCall(componentDefinition)
  ) {
    let currentPath: NodePath = componentDefinition;

    while (currentPath.parentPath) {
      if (currentPath.parentPath.isVariableDeclarator()) {
        documentation.set('actualName', getNameOrValue(currentPath.parentPath.get('id')));
        return;
      }
      if (currentPath.parentPath.isAssignmentExpression()) {
        const leftPath = currentPath.parentPath.get('left');

        if (leftPath.isIdentifier() || leftPath.isLiteral()) {
          documentation.set('actualName', getNameOrValue(leftPath));
          return;
        }
      }

      currentPath = currentPath.parentPath;
    }
    // Could not find an actual name
    documentation.set('actualName', '');
  }
};

type DocObj = Documentation & { actualName: string };

const defaultHandlers = Object.values(docgenHandlers).map((handler) => handler);
const defaultResolver = new docgenResolver.FindExportedDefinitionsResolver();
const defaultImporter = docgenImporters.fsImporter;
const handlers = [...defaultHandlers, actualNameHandler];

export default async function reactDocgenLoader(this: LoaderContext<any>, source: string) {
  const callback = this.async();

  try {
    const docgenResults = parse(source, {
      filename: this.resourcePath,
      resolver: defaultResolver,
      handlers,
      importer: defaultImporter,
    }) as DocObj[];

    const magicString = new MagicString(source);

    docgenResults.forEach((info) => {
      const { actualName, ...docgenInfo } = info;
      if (actualName) {
        const docNode = JSON.stringify(docgenInfo);
        magicString.append(`;${actualName}.__docgenInfo=${docNode}`);
      }
    });

    const map = magicString.generateMap({ hires: true });
    callback(null, magicString.toString(), map);
  } catch (error: any) {
    if (error.code === ERROR_CODES.MISSING_DEFINITION) {
      callback(null, source);
    } else {
      callback(error);
    }
  }
}
