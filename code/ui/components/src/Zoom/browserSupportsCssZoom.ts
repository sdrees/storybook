import { global } from '@storybook/global';

export function browserSupportsCssZoom(): boolean {
  try {
    // @ts-expect-error (we're testing for browser support)
    return global.document.implementation.createHTMLDocument('').body.style.zoom !== undefined;
  } catch (error) {
    return false;
  }
}
