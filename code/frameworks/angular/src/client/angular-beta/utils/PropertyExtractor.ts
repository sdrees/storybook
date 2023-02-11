import { CommonModule } from '@angular/common';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { InjectionToken, NgModule, Provider } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
  provideAnimations,
  provideNoopAnimations,
} from '@angular/platform-browser/animations';
import { NgModuleMetadata } from '../../types';
import { isDeclarable, isStandaloneComponent } from './NgComponentAnalyzer';
import { isComponentAlreadyDeclared } from './NgModulesAnalyzer';

const uniqueArray = (arr: any[]) => {
  return arr.flat(Number.MAX_VALUE).filter((value, index, self) => self.indexOf(value) === index);
};

const analyzeRestricted = (ngModule: NgModule) => {
  /**
   * BrowserModule is restricted,
   * because bootstrapApplication API, which mounts the component to the DOM,
   * automatically imports BrowserModule
   */
  if (ngModule === BrowserModule) {
    return [true];
  }
  /**
   * BrowserAnimationsModule imports BrowserModule, which is restricted,
   * because bootstrapApplication API, which mounts the component to the DOM,
   * automatically imports BrowserModule
   */
  if (ngModule === BrowserAnimationsModule) {
    return [true, provideAnimations()];
  }
  /**
   * NoopAnimationsModule imports BrowserModule, which is restricted,
   * because bootstrapApplication API, which mounts the component to the DOM,
   * automatically imports BrowserModule
   */
  if (ngModule === NoopAnimationsModule) {
    return [true, provideNoopAnimations()];
  }

  /**
   * HttpClient has to be provided manually as a singleton
   */
  if (ngModule === HttpClientModule) {
    return [true, provideHttpClient()];
  }

  return [false];
};

export const REMOVED_MODULES = new InjectionToken('REMOVED_MODULES');

/**
 * Analyze NgModule Metadata
 *
 * - Removes Restricted Imports
 * - Extracts providers from ModuleWithProviders
 * - Flattens imports
 * - Returns a new NgModuleMetadata object
 *
 *
 */
export const analyzeMetadata = (metadata: NgModuleMetadata) => {
  const declarations = [...(metadata?.declarations || [])];
  const providers = [...(metadata?.providers || [])];
  const singletons: any[] = [];
  const imports = [...(metadata?.imports || [])]
    .reduce((acc, ngModule) => {
      // remove ngModule and use only its providers if it is restricted
      // (e.g. BrowserModule, BrowserAnimationsModule, NoopAnimationsModule, ...etc)
      const [isRestricted, restrictedProviders] = analyzeRestricted(ngModule);
      if (isRestricted) {
        singletons.unshift(restrictedProviders || []);
        return acc;
      }

      // destructure into ngModule & providers if it is a ModuleWithProviders
      if (ngModule?.providers) {
        providers.unshift(ngModule.providers || []);
        // eslint-disable-next-line no-param-reassign
        ngModule = ngModule.ngModule;
      }

      // extract providers, declarations, singletons from ngModule
      // eslint-disable-next-line no-underscore-dangle
      const ngMetadata = ngModule?.__annotations__?.[0];
      if (ngMetadata) {
        const newMetadata = analyzeMetadata(ngMetadata);
        acc.unshift(...newMetadata.imports);
        providers.unshift(...newMetadata.providers);
        singletons.unshift(...newMetadata.singletons);
        declarations.unshift(...newMetadata.declarations);

        if (ngMetadata.standalone === true) {
          acc.push(ngModule);
        }
        // keeping a copy of the removed module
        providers.push({ provide: REMOVED_MODULES, useValue: ngModule, multi: true });
        return acc;
      }

      // include Angular official modules as-is
      if (ngModule.ɵmod) {
        acc.push(ngModule);
        return acc;
      }

      return acc;
    }, [])
    .flat(Number.MAX_VALUE);

  return { ...metadata, imports, providers, singletons, declarations };
};

/**
 * Extract Imports from NgModule
 *
 * CommonModule is always imported
 * Only standalone components are imported
 *
 */
export const extractImports = (metadata: NgModuleMetadata, storyComponent?: any) => {
  const { imports } = analyzeMetadata(metadata);

  if (isStandaloneComponent(storyComponent)) {
    imports.push(storyComponent);
  }

  return uniqueArray([CommonModule, imports]);
};

/**
 * Extract providers from NgModule
 *
 * - A new array is returned with:
 *   - metadata.providers
 *   - providers from each **ModuleWithProviders** (e.g. forRoot() & forChild() )
 *
 *
 */
export const extractProviders = (metadata: NgModuleMetadata): Provider[] => {
  const { providers } = analyzeMetadata(metadata);

  return uniqueArray(providers);
};

export const extractSingletons = (metadata: NgModuleMetadata): Provider[] => {
  const { singletons } = analyzeMetadata(metadata);

  return uniqueArray(singletons);
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
  const { declarations } = analyzeMetadata(metadata);

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
