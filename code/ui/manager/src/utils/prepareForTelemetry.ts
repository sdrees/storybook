/* eslint-disable local-rules/no-uncategorized-errors */
import { UncaughtManagerError } from '@storybook/core-events/manager-errors';
import { global } from '@storybook/global';
import type { BrowserInfo } from 'browser-dtector';
import BrowserDetector from 'browser-dtector';

let browserInfo: BrowserInfo | undefined;

function getBrowserInfo() {
  if (!browserInfo) {
    browserInfo = new BrowserDetector(global.navigator?.userAgent).getBrowserInfo();
  }

  return browserInfo;
}

export function prepareForTelemetry(
  originalError: Error & {
    fromStorybook?: boolean;
    category?: string;
    target?: any;
    currentTarget?: any;
    srcElement?: any;
    browserInfo?: BrowserInfo;
  }
) {
  let error = originalError;

  // DOM manipulation errors and other similar errors are not serializable as they contain
  // circular references to the window object. If that's the case, we make a simplified copy
  if (
    originalError.target === global ||
    originalError.currentTarget === global ||
    originalError.srcElement === global
  ) {
    error = new Error(originalError.message);
    error.name = originalError.name || error.name;
  }

  if (!originalError.fromStorybook) {
    error = new UncaughtManagerError({ error });
  }

  error.browserInfo = getBrowserInfo();

  return error;
}
