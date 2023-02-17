/* eslint-disable no-param-reassign */
import { createApp, h, reactive } from 'vue';
import type { RenderContext, ArgsStoryFn } from '@storybook/types';
import type { Args, StoryContext } from '@storybook/csf';
import type { StoryFnVueReturnType, VueRenderer } from './types';

export const render: ArgsStoryFn<VueRenderer> = (props, context) => {
  const { id, component: Component } = context;
  if (!Component) {
    throw new Error(
      `Unable to render story ${id} as the component annotation is missing from the default export`
    );
  }

  return h(Component, props, getSlots(props, context));
};

let setupFunction = (_app: any) => {};
export const setup = (fn: (app: any) => void) => {
  setupFunction = fn;
};

const map = new Map<
  VueRenderer['canvasElement'],
  { vueApp: ReturnType<typeof createApp>; reactiveArgs: any }
>();

const elementMap = new Map<VueRenderer['canvasElement'], StoryFnVueReturnType>();

export function renderToCanvas(
  { storyFn, forceRemount, showMain, showException, storyContext }: RenderContext<VueRenderer>,
  canvasElement: VueRenderer['canvasElement']
) {
  // fetch the story with the updated context (with reactive args)
  storyContext.args = reactive(storyContext.args);
  const element: StoryFnVueReturnType = storyFn();
  elementMap.set(canvasElement, element);

  const props = (element as any).render?.().props;
  const reactiveArgs = props ? reactive(props) : storyContext.args;

  const existingApp = map.get(canvasElement);
  if (existingApp && !forceRemount) {
    updateArgs(existingApp.reactiveArgs, reactiveArgs);
    return () => {
      teardown(existingApp.vueApp, canvasElement);
    };
  }

  if (existingApp && forceRemount) teardown(existingApp.vueApp, canvasElement);

  const storybookApp = createApp({
    render() {
      const renderedElement: any = elementMap.get(canvasElement);
      const current = renderedElement && renderedElement.template ? renderedElement : element;
      map.set(canvasElement, { vueApp: storybookApp, reactiveArgs });
      return h(current, reactiveArgs);
    },
  });

  storybookApp.config.errorHandler = (e: unknown) => showException(e as Error);
  setupFunction(storybookApp);
  storybookApp.mount(canvasElement);

  showMain();
  return () => {
    teardown(storybookApp, canvasElement);
  };
}

/**
 * get the slots as functions to be rendered
 * @param props
 * @param context
 */

function getSlots(props: Args, context: StoryContext<VueRenderer, Args>) {
  const { argTypes } = context;
  const slots = Object.entries(props)
    .filter(([key, value]) => argTypes[key]?.table?.category === 'slots')
    .map(([key, value]) => [key, () => h('span', JSON.stringify(value))]);

  return Object.fromEntries(slots);
}

/**
 *  update the reactive args
 * @param reactiveArgs
 * @param nextArgs
 * @returns
 */
function updateArgs(reactiveArgs: Args, nextArgs: Args) {
  if (!nextArgs) return;
  Object.keys(reactiveArgs).forEach((key) => {
    delete reactiveArgs[key];
  });
  Object.assign(reactiveArgs, nextArgs);
}

function teardown(
  storybookApp: ReturnType<typeof createApp>,
  canvasElement: VueRenderer['canvasElement']
) {
  storybookApp?.unmount();
  if (map.has(canvasElement)) map.delete(canvasElement);
}
