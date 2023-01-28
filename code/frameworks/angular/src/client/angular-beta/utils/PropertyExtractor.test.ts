import { CommonModule } from '@angular/common';
import { Component, Directive, Injectable, InjectionToken, NgModule } from '@angular/core';
import { extractDeclarations, extractImports, extractProviders } from './PropertyExtractor';

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
  describe('extractImports', () => {
    it('should return an array of imports', () => {
      const imports = extractImports({ imports: [TestModuleWithImportsAndProviders] });
      expect(imports).toEqual([CommonModule, TestModuleWithImportsAndProviders]);
    });

    it('should return an array of unique imports without providers', () => {
      const imports = extractImports({
        imports: [
          TestModuleWithImportsAndProviders,
          { ngModule: TestModuleWithImportsAndProviders, providers: [] },
        ],
      });
      expect(imports).toEqual([CommonModule, TestModuleWithImportsAndProviders]);
    });
  });

  describe('extractDeclarations', () => {
    it('should return an array of declarations', () => {
      const declarations = extractDeclarations({ declarations: [TestComponent1] }, TestComponent2);
      expect(declarations).toEqual([TestComponent1, TestComponent2]);
    });

    it('should ignore pre-declared components', () => {
      // TestComponent1 is declared as part of TestModuleWithDeclarations
      // TestModuleWithDeclarations is imported by TestModuleWithImportsAndProviders
      const declarations = extractDeclarations(
        {
          imports: [TestModuleWithImportsAndProviders],
          declarations: [TestComponent2, StandaloneTestComponent, TestDirective],
        },
        TestComponent1
      );
      expect(declarations).toEqual([TestComponent2, StandaloneTestComponent, TestDirective]);
    });

    it('should ignore standalone components', () => {
      const declarations = extractDeclarations(
        {
          imports: [TestModuleWithImportsAndProviders],
          declarations: [TestComponent1, TestComponent2, TestDirective],
        },
        StandaloneTestComponent
      );
      expect(declarations).toEqual([TestComponent1, TestComponent2, TestDirective]);
    });

    it('should ignore non components/directives/pipes', () => {
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
      expect(providers).toEqual([TestService]);
    });

    it('should return an array of unique providers', () => {
      const providers = extractProviders({
        imports: [{ ngModule: TestModuleWithImportsAndProviders, providers: [TestService] }],
        providers: [TestService, { provide: TEST_TOKEN, useValue: 123 }],
      });
      expect(providers).toEqual([
        TestService,
        {
          provide: new InjectionToken('testToken'),
          useValue: 123,
        },
      ]);
    });
  });
});
