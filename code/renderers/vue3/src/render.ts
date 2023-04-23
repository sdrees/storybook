/* eslint-disable no-param-reassign */
import type { ConcreteComponent } from 'vue';
import { createApp, h, isReactive, isVNode, reactive } from 'vue';
import type { RenderContext, ArgsStoryFn } from '@storybook/types';
import type { Args, StoryContext } from '@storybook/csf';

import type { VueRenderer, StoryFnVueReturnType, StoryID } from './types';

const slotsMap = new Map<
  StoryID,
  {
    component?: Omit<ConcreteComponent<any>, 'props'>;
    reactiveSlots?: Args;
  }
>();

export const render: ArgsStoryFn<VueRenderer> = (props, context) => {
  const { id, component: Component } = context;
  if (!Component) {
    throw new Error(
      `Unable to render story ${id} as the component annotation is missing from the default export`
    );
  }

  return h(Component, props, createOrUpdateSlots(context));
};

let setupFunction = (_app: any) => {};
export const setup = (fn: (app: any) => void) => {
  setupFunction = fn;
};

const map = new Map<
  VueRenderer['canvasElement'] | StoryID,
  {
    vueApp: ReturnType<typeof createApp>;
    reactiveArgs: Args;
    reactiveSlots?: Args;
  }
>();

export function renderToCanvas(
  { storyFn, forceRemount, showMain, showException, storyContext, id }: RenderContext<VueRenderer>,
  canvasElement: VueRenderer['canvasElement']
) {
  const existingApp = map.get(canvasElement);

  // if the story is already rendered and we are not forcing a remount, we just update the reactive args
  if (existingApp && !forceRemount) {
    // normally storyFn should be call once only in setup function,but because the nature of react and how storybook rendering the decorators
    // we need to call here to run the decorators again
    // i may wrap each decorator in memoized function to avoid calling it if the args are not changed
    const element = storyFn(); // call the story function to get the root element with all the decorators
    const args = getArgs(element, storyContext); // get args in case they are altered by decorators otherwise use the args from the context

    updateArgs(existingApp.reactiveArgs, args);
    return () => {
      teardown(existingApp.vueApp, canvasElement);
    };
  }
  if (existingApp && forceRemount) teardown(existingApp.vueApp, canvasElement);

  // create vue app for the story
  const vueApp = createApp({
    setup() {
      storyContext.args = reactive(storyContext.args);
      const rootElement = storyFn(); // call the story function to get the root element with all the decorators
      const args = getArgs(rootElement, storyContext); // get args in case they are altered by decorators otherwise use the args from the context
      const appState = {
        vueApp,
        reactiveArgs: reactive(args),
      };
      map.set(canvasElement, appState);

      return () => {
        return h(rootElement, appState.reactiveArgs);
      };
    },
  });
  vueApp.config.errorHandler = (e: unknown) => showException(e as Error);
  setupFunction(vueApp);
  vueApp.mount(canvasElement);

  showMain();
  return () => {
    teardown(vueApp, canvasElement);
  };
}

/**
 * generate slots for default story without render function template
 * @param context
 */

function generateSlots(context: StoryContext<VueRenderer, Args>) {
  const { argTypes } = context;
  const slots = Object.entries(argTypes)
    .filter(([key, value]) => argTypes[key]?.table?.category === 'slots')
    .map(([key, value]) => {
      const slotValue = context.args[key];
      return [key, typeof slotValue === 'function' ? slotValue : () => slotValue];
    });

  return reactive(Object.fromEntries(slots));
}
/**
 * get the args from the root element props if it is a vnode otherwise from the context
 * @param element is the root element of the story
 * @param storyContext is the story context
 */

function getArgs(element: StoryFnVueReturnType, storyContext: StoryContext<VueRenderer, Args>) {
  return element.props && isVNode(element) ? element.props : storyContext.args;
}

/**
 *  update the reactive args
 * @param reactiveArgs
 * @param nextArgs
 * @returns
 */
export function updateArgs(reactiveArgs: Args, nextArgs: Args) {
  if (Object.keys(nextArgs).length === 0) return;
  const currentArgs = isReactive(reactiveArgs) ? reactiveArgs : reactive(reactiveArgs);
  // delete all args in currentArgs that are not in nextArgs
  Object.keys(currentArgs).forEach((key) => {
    if (!(key in nextArgs)) {
      delete currentArgs[key];
    }
  });
  // update currentArgs with nextArgs
  Object.assign(currentArgs, nextArgs);
}

/**
 * unmount the vue app
 * @param storybookApp
 * @param canvasElement
 * @returns void
 * @private
 * */

function teardown(
  storybookApp: ReturnType<typeof createApp>,
  canvasElement: VueRenderer['canvasElement']
) {
  storybookApp?.unmount();
  if (map.has(canvasElement)) map.delete(canvasElement);
}

function createOrUpdateSlots(context: StoryContext<VueRenderer, Args>) {
  const { id: storyID, component } = context;
  const slots = generateSlots(context);
  if (slotsMap.has(storyID)) {
    const app = slotsMap.get(storyID);
    if (app?.reactiveSlots) updateArgs(app.reactiveSlots, slots);
    return app?.reactiveSlots;
  }
  slotsMap.set(storyID, { component, reactiveSlots: slots });
  return slots;
}
