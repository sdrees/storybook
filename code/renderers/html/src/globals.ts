// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - use ts-ignore instead of ts-expect-error to fix type issues in Angular sandbox
import global from 'global';

const { window: globalWindow } = global;

globalWindow.STORYBOOK_ENV = 'HTML';
