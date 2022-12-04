import { RenderContext, ArgsStoryFn } from '@storybook/types';

import { renderNgApp } from './angular/helpers';
import { AngularRenderer } from './types';

import { RendererFactory } from './angular-beta/RendererFactory';

export const rendererFactory = new RendererFactory();

export const render: ArgsStoryFn<AngularRenderer> = (props) => ({ props });

export async function renderToCanvas(
  {
    storyFn,
    showMain,
    forceRemount,
    storyContext: { parameters, component },
    id,
  }: RenderContext<AngularRenderer>,
  element: HTMLElement
) {
  showMain();

  if (parameters.angularLegacyRendering) {
    renderNgApp(storyFn, !forceRemount);
    return;
  }

  const renderer = await rendererFactory.getRendererInstance(id, element);

  await renderer.render({
    storyFnAngular: storyFn(),
    component,
    parameters,
    forced: !forceRemount,
    targetDOMNode: element,
  });
}
