// @ts-expect-error (Converted from ts-ignore)
import global from 'global';

const { window: globalWindow } = global;

if (globalWindow) {
  globalWindow.STORYBOOK_ENV = 'preact';
}
