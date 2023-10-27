import { instrument } from '@storybook/instrumenter';
import * as spy from '@vitest/spy';
import chai from 'chai';
import { FORCE_REMOUNT, STORY_RENDER_PHASE_CHANGED } from '@storybook/core-events';
import { addons } from '@storybook/preview-api';
import { expect as rawExpect } from './expect';

export * from '@vitest/spy';

const channel = addons.getChannel();

channel.on(FORCE_REMOUNT, () => spy.spies.forEach((mock) => mock.mockClear()));
channel.on(STORY_RENDER_PHASE_CHANGED, ({ newPhase }) => {
  if (newPhase === 'loading') spy.spies.forEach((mock) => mock.mockClear());
});

export const { expect } = instrument(
  { expect: rawExpect },
  {
    getKeys: (obj: Record<string, unknown>, depth) => {
      const privateApi = ['assert', '__methods', '__flags', '_obj'];
      if (obj.constructor === chai.Assertion) {
        const keys = Object.keys(Object.getPrototypeOf(obj)).filter(
          (it) => !privateApi.includes(it)
        );
        return depth > 2 ? keys : [...keys, 'not'];
      }
      return Object.keys(obj);
    },
    intercept: (method) => method !== 'expect',
  }
);

export * from './testing-library';
