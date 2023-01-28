import { CommonModule } from '@angular/common';
import { Provider } from '@angular/core';
import { NgModuleMetadata } from '../../types';
import { isDeclarable, isStandaloneComponent } from './NgComponentAnalyzer';
import { isComponentAlreadyDeclared } from './NgModulesAnalyzer';

const uniqueArray = (arr: any[]) => {
  return arr.flat(Number.MAX_VALUE).filter((value, index, self) => self.indexOf(value) === index);
};

/**
 * Extract Imports from NgModule
 *
 * CommonModule is always imported
 *
 * metadata.imports are flattened deeply and extracted into a new array
 *
 * - If ModuleWithProviders (e.g. forRoot() & forChild() ) is used, the ngModule is extracted without providers.
 *
 */
export const extractImports = (metadata: NgModuleMetadata) => {
  const imports = [CommonModule];

  const modules = (metadata.imports || []).flat(Number.MAX_VALUE);
  const withProviders = modules.filter((moduleDef) => !!moduleDef?.ngModule);
  const withoutProviders = modules.filter((moduleDef) => !withProviders.includes(moduleDef));

  return uniqueArray([
    imports,
    withoutProviders,
    withProviders.map((moduleDef) => moduleDef.ngModule),
  ]);
};

/**
 * Extract providers from NgModule
 *
 * - A new array is returned with:
 *   - metadata.providers
 *   - providers from each **ModuleWithProviders** (e.g. forRoot() & forChild() )
 *
 * - Use this in combination with extractImports to get all providers for a specific module
 *
 */
export const extractProviders = (metadata: NgModuleMetadata): Provider[] => {
  const providers = (metadata.providers || []) as Provider[];

  const moduleProviders: Provider[] = (metadata.imports || [])
    .flat(Number.MAX_VALUE)
    .filter((moduleDef) => !!moduleDef?.ngModule)
    .map((moduleDef) => moduleDef.providers || []);

  return uniqueArray([].concat(moduleProviders, providers));
};

/**
 * Extract declarations from NgModule
 *
 * - If a story component is provided, it will be added to the declarations array if:
 *    - It is a component or directive or pipe
 *    - It is not already declared
 *    - It is not a standalone component
 *
 */
export const extractDeclarations = (metadata: NgModuleMetadata, storyComponent?: any) => {
  const declarations = metadata.declarations || [];
  if (storyComponent) {
    const isStandalone = isStandaloneComponent(storyComponent);
    const isDeclared = isComponentAlreadyDeclared(storyComponent, declarations, metadata.imports);

    const requiresDeclaration = isDeclarable(storyComponent) && !isDeclared && !isStandalone;

    if (requiresDeclaration) {
      declarations.push(storyComponent);
    }
  }
  return uniqueArray(declarations);
};
