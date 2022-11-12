/* eslint-disable no-param-reassign */
import type { Store_RenderContext, ArgsStoryFn } from '@storybook/types';
import type { SvelteComponentTyped } from 'svelte';
// eslint-disable-next-line import/no-extraneous-dependencies
import PreviewRender from '@storybook/svelte/templates/PreviewRender.svelte';

import type { SvelteFramework } from './types';

const componentsByDomElement = new Map<SvelteFramework['canvasElement'], SvelteComponentTyped>();

function teardown(canvasElement: SvelteFramework['canvasElement']) {
  if (!componentsByDomElement.has(canvasElement)) {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we know it exists because we just checked
  componentsByDomElement.get(canvasElement)!.$destroy();

  canvasElement.innerHTML = '';
  componentsByDomElement.delete(canvasElement);
}

export function renderToCanvas(
  {
    storyFn,
    kind,
    name,
    showMain,
    showError,
    storyContext,
    forceRemount,
  }: Store_RenderContext<SvelteFramework>,
  canvasElement: SvelteFramework['canvasElement']
) {
  const existingComponent = componentsByDomElement.get(canvasElement);

  if (forceRemount) {
    teardown(canvasElement);
  }

  if (!existingComponent || forceRemount) {
    const createdComponent = new PreviewRender({
      target: canvasElement,
      props: {
        storyFn,
        storyContext,
        name,
        kind,
        showError,
      },
    }) as SvelteComponentTyped;
    componentsByDomElement.set(canvasElement, createdComponent);
  } else {
    existingComponent.$set({
      storyFn,
      storyContext,
      name,
      kind,
      showError,
    });
  }

  showMain();

  // teardown the component when the story changes
  return () => {
    teardown(canvasElement);
  };
}

export const render: ArgsStoryFn<SvelteFramework> = (args, context) => {
  const { id, component: Component } = context;
  if (!Component) {
    throw new Error(
      `Unable to render story ${id} as the component annotation is missing from the default export`
    );
  }

  return { Component, props: args };
};
