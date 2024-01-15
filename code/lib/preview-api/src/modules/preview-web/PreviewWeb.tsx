/* eslint-disable no-underscore-dangle */
import { global } from '@storybook/global';
import type { Renderer, ProjectAnnotations, ModuleImportFn } from '@storybook/types';

import { PreviewWithSelection } from './PreviewWithSelection';
import { UrlStore } from './UrlStore';
import { WebView } from './WebView';
import type { MaybePromise } from './Preview';

export class PreviewWeb<TRenderer extends Renderer> extends PreviewWithSelection<TRenderer> {
  constructor(
    public importFn: ModuleImportFn,

    public getProjectAnnotations: () => MaybePromise<ProjectAnnotations<TRenderer>>
  ) {
    super(importFn, getProjectAnnotations, new UrlStore(), new WebView());

    global.__STORYBOOK_PREVIEW__ = this;
  }
}
