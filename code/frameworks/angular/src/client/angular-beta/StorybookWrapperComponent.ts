import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ElementRef,
  OnDestroy,
  Type,
  ChangeDetectorRef,
  Component,
  Inject,
  ViewChild,
  ViewContainerRef,
  NgModule,
} from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { map, skip } from 'rxjs/operators';

import { ICollection, NgModuleMetadata } from '../types';
import { STORY_PROPS } from './StorybookProvider';
import {
  ComponentInputsOutputs,
  getComponentInputsOutputs,
  isDeclarable,
  isStandaloneComponent,
} from './utils/NgComponentAnalyzer';
import { isComponentAlreadyDeclaredInModules } from './utils/NgModulesAnalyzer';

const getNonInputsOutputsProps = (
  ngComponentInputsOutputs: ComponentInputsOutputs,
  props: ICollection = {}
) => {
  const inputs = ngComponentInputsOutputs.inputs
    .filter((i) => i.templateName in props)
    .map((i) => i.templateName);
  const outputs = ngComponentInputsOutputs.outputs
    .filter((o) => o.templateName in props)
    .map((o) => o.templateName);
  return Object.keys(props).filter((k) => ![...inputs, ...outputs].includes(k));
};

export const componentNgModules = new Map<any, Type<any>>();

/**
 * Wraps the story template into a component
 *
 * @param storyComponent
 * @param initialProps
 */
export const createStorybookWrapperComponent = (
  selector: string,
  template: string,
  storyComponent: Type<unknown> | undefined,
  styles: string[],
  moduleMetadata: NgModuleMetadata,
  initialProps?: ICollection
): Type<any> => {
  // In ivy, a '' selector is not allowed, therefore we need to just set it to anything if
  // storyComponent was not provided.
  const viewChildSelector = storyComponent ?? '__storybook-noop';

  const isStandalone = isStandaloneComponent(storyComponent);
  // Look recursively (deep) if the component is not already declared by an import module
  const requiresComponentDeclaration =
    isDeclarable(storyComponent) &&
    !isComponentAlreadyDeclaredInModules(
      storyComponent,
      moduleMetadata.declarations,
      moduleMetadata.imports
    ) &&
    !isStandalone;

  const providersNgModules = (moduleMetadata.providers ?? []).map((provider) => {
    if (!componentNgModules.get(provider)) {
      @NgModule({
        providers: [provider],
      })
      class ProviderModule {}

      componentNgModules.set(provider, ProviderModule);
    }

    return componentNgModules.get(provider);
  });

  if (!componentNgModules.get(storyComponent)) {
    const declarations = [
      ...(requiresComponentDeclaration ? [storyComponent] : []),
      ...(moduleMetadata.declarations ?? []),
    ];

    @NgModule({
      declarations,
      imports: [CommonModule, ...(moduleMetadata.imports ?? [])],
      exports: [...declarations, ...(moduleMetadata.imports ?? [])],
    })
    class StorybookComponentModule {}

    componentNgModules.set(storyComponent, StorybookComponentModule);
  }

  @Component({
    selector,
    template,
    standalone: true,
    imports: [
      CommonModule,
      componentNgModules.get(storyComponent),
      ...providersNgModules,
      ...(isStandalone ? [storyComponent] : []),
    ],
    styles,
    schemas: moduleMetadata.schemas,
  })
  class StorybookWrapperComponent implements AfterViewInit, OnDestroy {
    private storyComponentPropsSubscription: Subscription;

    private storyWrapperPropsSubscription: Subscription;

    @ViewChild(viewChildSelector, { static: true }) storyComponentElementRef: ElementRef;

    @ViewChild(viewChildSelector, { read: ViewContainerRef, static: true })
    storyComponentViewContainerRef: ViewContainerRef;

    // Used in case of a component without selector
    storyComponent = storyComponent ?? '';

    constructor(
      @Inject(STORY_PROPS) private storyProps$: Subject<ICollection | undefined>,
      private changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
      // Subscribes to the observable storyProps$ to keep these properties up to date
      this.storyWrapperPropsSubscription = this.storyProps$.subscribe((storyProps = {}) => {
        // All props are added as component properties
        Object.assign(this, storyProps);

        this.changeDetectorRef.detectChanges();
        this.changeDetectorRef.markForCheck();
      });
    }

    ngAfterViewInit(): void {
      // Bind properties to component, if the story have component
      if (this.storyComponentElementRef) {
        const ngComponentInputsOutputs = getComponentInputsOutputs(storyComponent);

        const initialOtherProps = getNonInputsOutputsProps(ngComponentInputsOutputs, initialProps);

        // Initializes properties that are not Inputs | Outputs
        // Allows story props to override local component properties
        initialOtherProps.forEach((p) => {
          (this.storyComponentElementRef as any)[p] = initialProps[p];
        });
        // `markForCheck` the component in case this uses changeDetection: OnPush
        // And then forces the `detectChanges`
        this.storyComponentViewContainerRef.injector.get(ChangeDetectorRef).markForCheck();
        this.changeDetectorRef.detectChanges();

        // Once target component has been initialized, the storyProps$ observable keeps target component properties than are not Input|Output up to date
        this.storyComponentPropsSubscription = this.storyProps$
          .pipe(
            skip(1),
            map((props) => {
              const propsKeyToKeep = getNonInputsOutputsProps(ngComponentInputsOutputs, props);
              return propsKeyToKeep.reduce((acc, p) => ({ ...acc, [p]: props[p] }), {});
            })
          )
          .subscribe((props) => {
            // Replace inputs with new ones from props
            Object.assign(this.storyComponentElementRef, props);

            // `markForCheck` the component in case this uses changeDetection: OnPush
            // And then forces the `detectChanges`
            this.storyComponentViewContainerRef.injector.get(ChangeDetectorRef).markForCheck();
            this.changeDetectorRef.detectChanges();
          });
      }
    }

    ngOnDestroy(): void {
      if (this.storyComponentPropsSubscription != null) {
        this.storyComponentPropsSubscription.unsubscribe();
      }
      if (this.storyWrapperPropsSubscription != null) {
        this.storyWrapperPropsSubscription.unsubscribe();
      }
    }
  }
  return StorybookWrapperComponent;
};
