import { values } from './globals/runtime';
import { globals } from './globals/types';

const getKeys = Object.keys as <T extends object>(obj: T) => Array<keyof T>;

// Apply all the globals
getKeys(globals).forEach((key) => {
  (globalThis as any)[globals[key]] = values[key];
});
