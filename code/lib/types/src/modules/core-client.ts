/* eslint-disable @typescript-eslint/naming-convention */
import type { Store_RenderContext } from './store';
// import { Store_RenderContext, ProjectAnnotations } from './store';
// import { ArgsStoryFn } from './csf';

export interface CoreClient_PreviewError {
  message?: string;
  stack?: string;
}

export interface CoreClient_RequireContext {
  keys: () => string[];
  (id: string): any;
  resolve(id: string): string;
}
export type CoreClient_LoaderFunction = () => void | any[];
export type Loadable =
  | CoreClient_RequireContext
  | CoreClient_RequireContext[]
  | CoreClient_LoaderFunction;

export type { Store_RenderContext as RenderContext };

// The function used by a framework to render story to the DOM
export type CoreClient_RenderStoryFunction = (context: Store_RenderContext) => void;
