import { jest, describe, it, expect } from '@jest/globals';
import { Channel } from '@storybook/channels';
import type { AnyFramework, Addon_StoryIndexEntry } from '@storybook/types';
import type { StoryStore } from '@storybook/store';
import { PREPARE_ABORTED } from './Render';

import { StoryRender } from './StoryRender';

const entry = {
  type: 'story',
  id: 'component--a',
  name: 'A',
  title: 'component',
  importPath: './component.stories.ts',
} as Addon_StoryIndexEntry;

const createGate = (): [Promise<any | undefined>, (_?: any) => void] => {
  let openGate = (_?: any) => {};
  const gate = new Promise<any | undefined>((resolve) => {
    openGate = resolve;
  });
  return [gate, openGate];
};

describe('StoryRender', () => {
  it('throws PREPARE_ABORTED if torndown during prepare', async () => {
    const [importGate, openImportGate] = createGate();
    const mockStore = {
      loadStory: jest.fn(async () => {
        await importGate;
        return {};
      }),
      cleanupStory: jest.fn(),
    };

    const render = new StoryRender(
      new Channel(),
      mockStore as unknown as StoryStore<AnyFramework>,
      jest.fn(),
      {} as any,
      entry.id,
      'story'
    );

    const preparePromise = render.prepare();

    render.teardown();

    openImportGate();

    await expect(preparePromise).rejects.toThrowError(PREPARE_ABORTED);
  });
});
