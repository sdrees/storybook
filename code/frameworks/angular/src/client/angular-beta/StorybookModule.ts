import { NgModule, Type } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { Subject } from 'rxjs';
import { ICollection, StoryFnAngularReturnType } from '../types';
import { storyPropsProvider } from './StorybookProvider';
import { isComponentAlreadyDeclaredInModules } from './utils/NgModulesAnalyzer';
import { isDeclarable, isStandaloneComponent } from './utils/NgComponentAnalyzer';
import { createStorybookWrapperComponent } from './StorybookWrapperComponent';

export const getStorybookModuleMetadata = (
  {
    storyFnAngular,
    component,
    targetSelector,
  }: {
    storyFnAngular: StoryFnAngularReturnType;
    component?: any;
    targetSelector: string;
  },
  storyProps$: Subject<ICollection>
): NgModule => {
  const { props, styles, moduleMetadata = {} } = storyFnAngular;
  const { template } = storyFnAngular;

  /**
   * Create a component that wraps generated template and gives it props
   */
  const ComponentToInject = createStorybookWrapperComponent(
    targetSelector,
    template,
    component,
    styles,
    props
  );

  const isStandalone = isStandaloneComponent(component);
  // Look recursively (deep) if the component is not already declared by an import module
  const requiresComponentDeclaration =
    isDeclarable(component) &&
    !isComponentAlreadyDeclaredInModules(
      component,
      moduleMetadata.declarations,
      moduleMetadata.imports
    ) &&
    !isStandalone;

  return {
    declarations: [
      ...(requiresComponentDeclaration ? [component] : []),
      ComponentToInject,
      ...(moduleMetadata.declarations ?? []),
    ],
    imports: [
      BrowserModule,
      ...(isStandalone ? [component] : []),
      ...(moduleMetadata.imports ?? []),
    ],
    providers: [storyPropsProvider(storyProps$), ...(moduleMetadata.providers ?? [])],
    entryComponents: [...(moduleMetadata.entryComponents ?? [])],
    schemas: [...(moduleMetadata.schemas ?? [])],
    bootstrap: [ComponentToInject],
  };
};

export const createStorybookModule = (ngModule: NgModule): Type<unknown> => {
  @NgModule(ngModule)
  class StorybookModule {}
  return StorybookModule;
};
