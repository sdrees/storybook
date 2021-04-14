/* eslint-disable no-undef */
import { enableProdMode, NgModule, PlatformRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { BehaviorSubject, Subject } from 'rxjs';
import { ICollection, StoryFnAngularReturnType } from '../types';
import { Parameters } from '../types-6-0';
import { createStorybookModule, getStorybookModuleMetadata } from './StorybookModule';

/**
 * Bootstrap angular application and allows to change the rendering dynamically
 * To be used as a singleton so has to set global properties of render function
 */
export class RendererService {
  private static instance: RendererService;

  public static SELECTOR_STORYBOOK_WRAPPER = 'storybook-wrapper';

  public static getInstance() {
    if (!RendererService.instance) {
      RendererService.instance = new RendererService();
    }
    return RendererService.instance;
  }

  public platform: PlatformRef;

  private staticRoot = document.getElementById('root');

  // Observable to change the properties dynamically without reloading angular module&component
  private storyProps$: Subject<ICollection | undefined>;

  private currentStoryRender: {
    storyFnAngular: StoryFnAngularReturnType;
    moduleMetadataSnapshot: string;
  };

  constructor() {
    if (typeof NODE_ENV === 'string' && NODE_ENV !== 'development') {
      try {
        // platform should be set after enableProdMode()
        enableProdMode();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.debug(e);
      }
    }
  }

  /**
   * Bootstrap main angular module with main component or send only new `props` with storyProps$
   *
   * @param storyFnAngular {StoryFnAngularReturnType}
   * @param forced {boolean} If :
   * - true render will only use the StoryFn `props' in storyProps observable that will update sotry's component/template properties. Improves performance without reloading the whole module&component if props changes
   * - false fully recharges or initializes angular module & component
   * @param parameters {Parameters}
   */
  public async render({
    storyFnAngular,
    forced,
    parameters,
  }: {
    storyFnAngular: StoryFnAngularReturnType;
    forced: boolean;
    parameters: Parameters;
  }) {
    const storyProps$ = new BehaviorSubject<ICollection>(storyFnAngular.props);
    const moduleMetadata = getStorybookModuleMetadata({ storyFnAngular, parameters }, storyProps$);

    if (
      !this.fullRendererRequired({
        storyFnAngular,
        moduleMetadata,
        forced,
      })
    ) {
      this.storyProps$.next(storyFnAngular.props);

      return;
    }

    // Complete last BehaviorSubject and set a new one for the current module
    if (this.storyProps$) {
      this.storyProps$.complete();
    }
    this.storyProps$ = storyProps$;

    await this.newPlatformBrowserDynamic().bootstrapModule(createStorybookModule(moduleMetadata));
  }

  public newPlatformBrowserDynamic() {
    // Before creating a new platform, we destroy the previous one cleanly.
    this.destroyPlatformBrowserDynamic();

    this.initAngularRootElement();
    this.platform = platformBrowserDynamic();

    return this.platform;
  }

  public destroyPlatformBrowserDynamic() {
    if (this.platform && !this.platform.destroyed) {
      // Destroys the current Angular platform and all Angular applications on the page.
      // So call each angular ngOnDestroy and avoid memory leaks
      this.platform.destroy();
    }
  }

  private initAngularRootElement() {
    // Adds DOM element that angular will use as bootstrap component
    const storybookWrapperElement = document.createElement(
      RendererService.SELECTOR_STORYBOOK_WRAPPER
    );
    this.staticRoot.innerHTML = '';
    this.staticRoot.appendChild(storybookWrapperElement);
  }

  private fullRendererRequired({
    storyFnAngular,
    moduleMetadata,
    forced,
  }: {
    storyFnAngular: StoryFnAngularReturnType;
    moduleMetadata: NgModule;
    forced: boolean;
  }) {
    const { currentStoryRender: lastStoryRender } = this;

    this.currentStoryRender = {
      storyFnAngular,
      moduleMetadataSnapshot: JSON.stringify(moduleMetadata),
    };

    if (
      // check `forceRender` of story RenderContext
      !forced ||
      // if it's the first rendering and storyProps$ is not init
      !this.storyProps$
    ) {
      return true;
    }

    // force the rendering if the template has changed
    const hasChangedTemplate =
      !!storyFnAngular?.template &&
      lastStoryRender?.storyFnAngular?.template !== storyFnAngular.template;
    if (hasChangedTemplate) {
      return true;
    }

    // force the rendering if the metadata structure has changed
    const hasChangedModuleMetadata =
      this.currentStoryRender?.moduleMetadataSnapshot !== lastStoryRender?.moduleMetadataSnapshot;
    return hasChangedModuleMetadata;
  }
}
