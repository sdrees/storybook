import { Channel } from '@storybook/channels';
import type { Renderer, DocsIndexEntry } from '@storybook/types';
import type { StoryStore } from '../../store';
import { PREPARE_ABORTED } from './Render';

import { MdxDocsRender } from './MdxDocsRender';

const entry = {
  type: 'docs',
  id: 'introduction--docs',
  name: 'Docs',
  title: 'Introduction',
  importPath: './Introduction.mdx',
  storiesImports: [],
} as DocsIndexEntry;

const createGate = (): [Promise<any | undefined>, (_?: any) => void] => {
  let openGate = (_?: any) => {};
  const gate = new Promise<any | undefined>((resolve) => {
    openGate = resolve;
  });
  return [gate, openGate];
};

describe('MdxDocsRender', () => {
  it('throws PREPARE_ABORTED if torndown during prepare', async () => {
    const [importGate, openImportGate] = createGate();
    const mockStore = {
      loadEntry: jest.fn(async () => {
        await importGate;
        return {};
      }),
    };

    const render = new MdxDocsRender(
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
