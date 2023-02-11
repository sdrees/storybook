import { CommonModule } from '@angular/common';
import { Component, Directive, Injectable, InjectionToken, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
  provideAnimations,
  provideNoopAnimations,
} from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import {
  analyzeMetadata,
  extractDeclarations,
  extractImports,
  extractProviders,
  extractSingletons,
  REMOVED_MODULES,
} from './PropertyExtractor';
import { WithAnimationsModule, WithOfficialModule } from '../__testfixtures__/test.module';

const TEST_TOKEN = new InjectionToken('testToken');
const TestTokenProvider = { provide: TEST_TOKEN, useValue: 123 };
const TestService = Injectable()(class {});
const TestComponent1 = Component({})(class {});
const TestComponent2 = Component({})(class {});
const StandaloneTestComponent = Component({ standalone: true })(class {});
const TestDirective = Directive({})(class {});
const TestModuleWithDeclarations = NgModule({ declarations: [TestComponent1] })(class {});
const TestModuleWithImportsAndProviders = NgModule({
  imports: [TestModuleWithDeclarations],
  providers: [TestTokenProvider],
})(class {});

describe('PropertyExtractor', () => {
  describe('analyzeMetadata', () => {
    it('should remove BrowserModule', () => {
      const metadata = {
        imports: [BrowserModule],
      };
      const { imports, providers, singletons } = analyzeMetadata(metadata);
      expect(imports.flat(Number.MAX_VALUE)).toEqual([]);
      expect(providers.flat(Number.MAX_VALUE)).toEqual([]);
      expect(singletons.flat(Number.MAX_VALUE)).toEqual([]);
    });

    it('should remove BrowserAnimationsModule and use its providers instead', () => {
      const metadata = {
        imports: [BrowserAnimationsModule],
      };
      const { imports, providers, singletons } = analyzeMetadata(metadata);
      expect(imports.flat(Number.MAX_VALUE)).toEqual([]);
      expect(providers.flat(Number.MAX_VALUE)).toEqual([]);
      expect(singletons.flat(Number.MAX_VALUE)).toEqual(provideAnimations());
    });

    it('should remove NoopAnimationsModule and use its providers instead', () => {
      const metadata = {
        imports: [NoopAnimationsModule],
      };
      const { imports, providers, singletons } = analyzeMetadata(metadata);
      expect(imports.flat(Number.MAX_VALUE)).toEqual([]);
      expect(providers.flat(Number.MAX_VALUE)).toEqual([]);
      expect(singletons.flat(Number.MAX_VALUE)).toEqual(provideNoopAnimations());
    });

    it('should remove Browser/Animations modules recursively', () => {
      const metadata = {
        imports: [WithAnimationsModule],
      };
      const { imports, providers, singletons } = analyzeMetadata(metadata);
      expect(imports.flat(Number.MAX_VALUE)).toEqual([]);
      expect(providers.flat(Number.MAX_VALUE)).toEqual([
        { provide: REMOVED_MODULES, useValue: WithAnimationsModule, multi: true },
      ]);
      expect(singletons.flat(Number.MAX_VALUE)).toEqual(provideAnimations());
    });

    it('should not destructure Angular official module', () => {
      const metadata = {
        imports: [WithOfficialModule],
      };
      const { imports, providers, singletons } = analyzeMetadata(metadata);
      expect(imports.flat(Number.MAX_VALUE)).toEqual([CommonModule, HttpClientModule]);
      expect(providers.flat(Number.MAX_VALUE)).toEqual([
        { provide: REMOVED_MODULES, useValue: WithOfficialModule, multi: true },
      ]);
      expect(singletons.flat(Number.MAX_VALUE)).toEqual([]);
    });
  });

  describe('extractImports', () => {
    it('should return Angular official modules', () => {
      const imports = extractImports({ imports: [TestModuleWithImportsAndProviders] });
      expect(imports).toEqual([CommonModule]);
    });

    it('should return standalone components', () => {
      const imports = extractImports(
        {
          imports: [TestModuleWithImportsAndProviders],
        },
        StandaloneTestComponent
      );
      expect(imports).toEqual([CommonModule, StandaloneTestComponent]);
    });

    it('should not return any regular modules (they get destructured)', () => {
      const imports = extractImports({
        imports: [
          TestModuleWithDeclarations,
          { ngModule: TestModuleWithImportsAndProviders, providers: [] },
        ],
      });
      expect(imports).toEqual([CommonModule]);
    });
  });

  describe('extractDeclarations', () => {
    it('should return an array of declarations that contains `storyComponent`', () => {
      const declarations = extractDeclarations({ declarations: [TestComponent1] }, TestComponent2);
      expect(declarations).toEqual([TestComponent1, TestComponent2]);
    });

    it('should ignore `storyComponent` if it is already declared', () => {
      const declarations = extractDeclarations(
        {
          imports: [TestModuleWithImportsAndProviders],
          declarations: [TestComponent2, StandaloneTestComponent, TestDirective],
        },
        TestComponent1
      );
      expect(declarations).toEqual([
        TestComponent1,
        TestComponent2,
        StandaloneTestComponent,
        TestDirective,
      ]);
    });

    it('should ignore `storyComponent` if it is standalone', () => {
      const declarations = extractDeclarations(
        {
          imports: [TestModuleWithImportsAndProviders],
          declarations: [TestComponent1, TestComponent2, TestDirective],
        },
        StandaloneTestComponent
      );
      expect(declarations).toEqual([TestComponent1, TestComponent2, TestDirective]);
    });

    it('should ignore `storyComponent` if it is not a component/directive/pipe', () => {
      const declarations = extractDeclarations(
        {
          imports: [TestModuleWithImportsAndProviders],
          declarations: [TestComponent1, TestComponent2, StandaloneTestComponent],
        },
        TestService
      );
      expect(declarations).toEqual([TestComponent1, TestComponent2, StandaloneTestComponent]);
    });
  });

  describe('extractProviders', () => {
    it('should return an array of providers', () => {
      const providers = extractProviders({
        providers: [TestService],
      });
      expect(providers).toEqual([TestService]);
    });

    it('should return an array of providers extracted from ModuleWithProviders', () => {
      const providers = extractProviders({
        imports: [{ ngModule: TestModuleWithImportsAndProviders, providers: [TestService] }],
      });
      expect(providers).toEqual([
        { provide: TEST_TOKEN, useValue: 123 },
        { provide: REMOVED_MODULES, useValue: TestModuleWithDeclarations, multi: true },
        TestService,
        { provide: REMOVED_MODULES, useValue: TestModuleWithImportsAndProviders, multi: true },
      ]);
    });

    it('should return an array of unique providers', () => {
      const providers = extractProviders({
        imports: [{ ngModule: TestModuleWithImportsAndProviders, providers: [TestService] }],
        providers: [TestService, { provide: TEST_TOKEN, useValue: 123 }],
      });
      expect(providers).toEqual([
        { provide: TEST_TOKEN, useValue: 123 },
        { provide: REMOVED_MODULES, useValue: TestModuleWithDeclarations, multi: true },
        TestService,
        {
          provide: new InjectionToken('testToken'),
          useValue: 123,
        },
        {
          provide: REMOVED_MODULES,
          useValue: TestModuleWithImportsAndProviders,
          multi: true,
        },
      ]);
    });

    it('should return an array of singletons extracted', () => {
      const singeltons = extractSingletons({
        imports: [BrowserAnimationsModule],
      });

      expect(singeltons).toEqual(provideAnimations());
    });
  });
});
