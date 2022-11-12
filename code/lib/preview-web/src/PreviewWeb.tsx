import type { Framework } from '@storybook/types';

import { PreviewWithSelection } from './PreviewWithSelection';
import { UrlStore } from './UrlStore';
import { WebView } from './WebView';

export class PreviewWeb<TFramework extends Framework> extends PreviewWithSelection<TFramework> {
  constructor() {
    super(new UrlStore(), new WebView());
  }
}
