import { dedent } from 'ts-dedent';
import { createApp, h } from 'vue';
import type { RenderContext, ArgsStoryFn } from '@storybook/types';

import type { StoryFnVueReturnType, VueRenderer } from './types';

export const render: ArgsStoryFn<VueRenderer> = (props, context) => {
  const { id, component: Component } = context;
  if (!Component) {
    throw new Error(
      `Unable to render story ${id} as the component annotation is missing from the default export`
    );
  }

  return h(Component, props);
};

let setupFunction = (app: any) => {};
export const setup = (fn: (app: any) => void) => {
  setupFunction = fn;
};

const map = new Map<VueRenderer['canvasElement'], ReturnType<typeof createApp>>();

export function renderToCanvas(
  { title, name, storyFn, showMain, showError, showException }: RenderContext<VueRenderer>,
  canvasElement: VueRenderer['canvasElement']
) {
  // TODO: explain cyclical nature of these app => story => mount
  let element: StoryFnVueReturnType;
  const storybookApp = createApp({
    unmounted() {
      map.delete(canvasElement);
    },
    render() {
      map.set(canvasElement, storybookApp);
      setupFunction(storybookApp);
      return h(element);
    },
  });
  storybookApp.config.errorHandler = (e: unknown) => showException(e as Error);
  element = storyFn();

  if (!element) {
    showError({
      title: `Expecting a Vue component from the story: "${name}" of "${title}".`,
      description: dedent`
      Did you forget to return the Vue component from the story?
      Use "() => ({ template: '<my-comp></my-comp>' })" or "() => ({ components: MyComp, template: '<my-comp></my-comp>' })" when defining the story.
      `,
    });
    return;
  }

  showMain();

  map.get(canvasElement)?.unmount();

  storybookApp.mount(canvasElement);
}
