import type { Store_RenderContext, ArgsStoryFn } from '@storybook/types';
import type { SvelteComponentTyped } from 'svelte';
// eslint-disable-next-line import/no-extraneous-dependencies
import PreviewRender from '@storybook/svelte/templates/PreviewRender.svelte';

import type { SvelteFramework } from './types';

const componentsByDomElement = new Map<Element, SvelteComponentTyped>();

function teardown(domElement: Element) {
  if (!componentsByDomElement.has(domElement)) {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we know it exists because we just checked
  componentsByDomElement.get(domElement)!.$destroy();

  // eslint-disable-next-line no-param-reassign -- this is on purpose
  domElement.innerHTML = '';
  componentsByDomElement.delete(domElement);
}

export function renderToDOM(
  {
    storyFn,
    kind,
    name,
    showMain,
    showError,
    storyContext,
    forceRemount,
  }: Store_RenderContext<SvelteFramework>,
  domElement: Element
) {
  const existingComponent = componentsByDomElement.get(domElement);

  if (forceRemount) {
    teardown(domElement);
  }

  if (!existingComponent || forceRemount) {
    const createdComponent = new PreviewRender({
      target: domElement,
      props: {
        storyFn,
        storyContext,
        name,
        kind,
        showError,
      },
    }) as SvelteComponentTyped;
    componentsByDomElement.set(domElement, createdComponent);
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
    teardown(domElement);
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
