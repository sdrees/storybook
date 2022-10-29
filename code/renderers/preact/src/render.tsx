/** @jsx h */
import * as preact from 'preact';
import { dedent } from 'ts-dedent';
import type { Store_RenderContext, ArgsStoryFn } from '@storybook/types';

import type { StoryFnPreactReturnType, PreactFramework } from './types';

const { h } = preact;

export const render: ArgsStoryFn<PreactFramework> = (args, context) => {
  const { id, component: Component } = context;
  if (!Component) {
    throw new Error(
      `Unable to render story ${id} as the component annotation is missing from the default export`
    );
  }

  // @ts-expect-error I think the type of Component should be Preact.ComponentType, but even that
  // doens't make TS happy, I suspect because TS wants "react" components.
  return <Component {...args} />;
};

let renderedStory: Element;

function preactRender(story: StoryFnPreactReturnType | null, domElement: Element): void {
  // @ts-expect-error (Converted from ts-ignore)
  if (preact.Fragment) {
    // Preact 10 only:
    preact.render(story, domElement);
  } else {
    renderedStory = preact.render(story, domElement, renderedStory) as unknown as Element;
  }
}

const StoryHarness: preact.FunctionalComponent<{
  name: string;
  title: string;
  showError: Store_RenderContext<PreactFramework>['showError'];
  storyFn: () => any;
  domElement: Element;
}> = ({ showError, name, title, storyFn, domElement }) => {
  const content = preact.h(storyFn as any, null);
  if (!content) {
    showError({
      title: `Expecting a Preact element from the story: "${name}" of "${title}".`,
      description: dedent`
        Did you forget to return the Preact element from the story?
        Use "() => (<MyComp/>)" or "() => { return <MyComp/>; }" when defining the story.
      `,
    });
    return null;
  }
  return content;
};

export function renderToDOM(
  { storyFn, title, name, showMain, showError, forceRemount }: Store_RenderContext<PreactFramework>,
  domElement: Element
) {
  if (forceRemount) {
    preactRender(null, domElement);
  }

  showMain();

  preactRender(preact.h(StoryHarness, { name, title, showError, storyFn, domElement }), domElement);
}
