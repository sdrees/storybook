import { values } from './globals/runtime';
import { Keys } from './globals/types';

const getKeys = Object.keys as <T extends object>(obj: T) => Array<keyof T>;

// Apply all the globals
getKeys(Keys).forEach((key) => {
  (globalThis as any)[Keys[key]] = values[key];
});
