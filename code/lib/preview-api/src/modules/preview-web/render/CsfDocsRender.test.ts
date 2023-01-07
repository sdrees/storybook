import { Channel } from '@storybook/channels';
import type { Renderer, DocsIndexEntry } from '@storybook/types';
import type { StoryStore } from '../../store';
import { PREPARE_ABORTED } from './Render';

import { CsfDocsRender } from './CsfDocsRender';

const entry = {
  type: 'docs',
  id: 'component--docs',
  name: 'Docs',
  title: 'Component',
  importPath: './Component.stories.ts',
  storiesImports: [],
  tags: ['autodocs'],
} as DocsIndexEntry;

const createGate = (): [Promise<any | undefined>, (_?: any) => void] => {
  let openGate = (_?: any) => {};
  const gate = new Promise<any | undefined>((resolve) => {
    openGate = resolve;
  });
  return [gate, openGate];
};

describe('CsfDocsRender', () => {
  it('throws PREPARE_ABORTED if torndown during prepare', async () => {
    const [importGate, openImportGate] = createGate();
    const mockStore = {
      loadEntry: jest.fn(async () => {
        await importGate;
        return {};
      }),
    };

    const render = new CsfDocsRender(
      new Channel(),
      mockStore as unknown as StoryStore<Renderer>,
      entry
    );

    const preparePromise = render.prepare();

    render.teardown();

    openImportGate();

    await expect(preparePromise).rejects.toThrowError(PREPARE_ABORTED);
  });
});
