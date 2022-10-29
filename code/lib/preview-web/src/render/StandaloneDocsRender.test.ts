import { jest, describe, it, expect } from '@jest/globals';
import { Channel } from '@storybook/channels';
import type { AnyFramework, Addon_StandaloneDocsIndexEntry } from '@storybook/types';
import type { StoryStore } from '@storybook/store';
import { PREPARE_ABORTED } from './Render';

import { StandaloneDocsRender } from './StandaloneDocsRender';

const entry = {
  type: 'docs',
  id: 'introduction--docs',
  name: 'Docs',
  title: 'Introduction',
  importPath: './Introduction.mdx',
  storiesImports: [],
  standalone: true,
} as Addon_StandaloneDocsIndexEntry;

const createGate = (): [Promise<any | undefined>, (_?: any) => void] => {
  let openGate = (_?: any) => {};
  const gate = new Promise<any | undefined>((resolve) => {
    openGate = resolve;
  });
  return [gate, openGate];
};

describe('StandaloneDocsRender', () => {
  it('throws PREPARE_ABORTED if torndown during prepare', async () => {
    const [importGate, openImportGate] = createGate();
    const mockStore = {
      loadEntry: jest.fn(async () => {
        await importGate;
        return {};
      }),
    };

    const render = new StandaloneDocsRender(
      new Channel(),
      mockStore as unknown as StoryStore<AnyFramework>,
      entry
    );

    const preparePromise = render.prepare();

    render.teardown();

    openImportGate();

    await expect(preparePromise).rejects.toThrowError(PREPARE_ABORTED);
  });
});
