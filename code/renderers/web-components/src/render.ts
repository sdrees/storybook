/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-param-reassign */
import global from 'global';

import { dedent } from 'ts-dedent';
import { render as litRender } from 'lit-html';
// Keep `.js` extension to avoid issue with Webpack (related to export map?)
// eslint-disable-next-line import/extensions
import { isTemplateResult } from 'lit-html/directive-helpers.js';
import { simulatePageLoad, simulateDOMContentLoaded } from '@storybook/preview-web';
import type { Store_RenderContext, ArgsStoryFn } from '@storybook/types';
import type { WebComponentsFramework } from './types';

const { Node } = global;

export const render: ArgsStoryFn<WebComponentsFramework> = (args, context) => {
  const { id, component } = context;
  if (!component) {
    throw new Error(
      `Unable to render story ${id} as the component annotation is missing from the default export`
    );
  }

  const element = document.createElement(component);
  Object.entries(args).forEach(([key, val]) => {
    // @ts-ignore
    element[key] = val;
  });
  return element;
};

export function renderToDOM(
  {
    storyFn,
    kind,
    name,
    showMain,
    showError,
    forceRemount,
  }: Store_RenderContext<WebComponentsFramework>,
  domElement: Element
) {
  const element = storyFn();

  showMain();
  if (isTemplateResult(element)) {
    // `render` stores the TemplateInstance in the Node and tries to update based on that.
    // Since we reuse `domElement` for all stories, remove the stored instance first.
    // But forceRemount means that it's the same story, so we want too keep the state in that case.
    if (forceRemount || !domElement.querySelector('[id="root-inner"]')) {
      domElement.innerHTML = '<div id="root-inner"></div>';
    }
    const renderTo = domElement.querySelector<HTMLElement>('[id="root-inner"]');

    litRender(element, renderTo);
    simulatePageLoad(domElement);
  } else if (typeof element === 'string') {
    domElement.innerHTML = element;
    simulatePageLoad(domElement);
  } else if (element instanceof Node) {
    // Don't re-mount the element if it didn't change and neither did the story
    if (domElement.firstChild === element && !forceRemount) {
      return;
    }

    domElement.innerHTML = '';
    domElement.appendChild(element);
    simulateDOMContentLoaded();
  } else {
    showError({
      title: `Expecting an HTML snippet or DOM node from the story: "${name}" of "${kind}".`,
      description: dedent`
        Did you forget to return the HTML snippet from the story?
        Use "() => <your snippet or node>" or when defining the story.
      `,
    });
  }
}
