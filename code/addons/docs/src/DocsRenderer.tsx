import React from 'react';
import ReactDOM from 'react-dom';
import type { Renderer, Parameters, DocsContextProps, DocsRenderFunction } from '@storybook/types';
import { Docs, CodeOrSourceMdx, AnchorMdx, HeadersMdx } from '@storybook/blocks';

// TS doesn't like that we export a component with types that it doesn't know about (TS4203)
export const defaultComponents: Record<string, any> = {
  code: CodeOrSourceMdx,
  a: AnchorMdx,
  ...HeadersMdx,
};

export class DocsRenderer<TRenderer extends Renderer> {
  public render: DocsRenderFunction<TRenderer>;

  public unmount: (element: HTMLElement) => void;

  constructor() {
    this.render = (
      context: DocsContextProps<TRenderer>,
      docsParameter: Parameters,
      element: HTMLElement,
      callback: () => void
    ): void => {
      const components = {
        ...defaultComponents,
        ...docsParameter?.components,
      };

      import('@mdx-js/react').then(({ MDXProvider }) => {
        ReactDOM.render(
          <MDXProvider components={components}>
            <Docs context={context} docsParameter={docsParameter} />
          </MDXProvider>,
          element,
          callback
        );
      });
    };

    this.unmount = (element: HTMLElement) => {
      ReactDOM.unmountComponentAtNode(element);
    };
  }
}
