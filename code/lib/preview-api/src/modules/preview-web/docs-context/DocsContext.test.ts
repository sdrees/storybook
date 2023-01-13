import { Channel } from '@storybook/channels';
import type { Renderer } from '@storybook/types';
import type { StoryStore } from '../../store';

import { DocsContext } from './DocsContext';
import { csfFileParts } from './test-utils';

const channel = new Channel();
const renderStoryToElement = jest.fn();

describe('resolveModuleExport', () => {
  const { story, csfFile, storyExport, metaExport, moduleExports, component } = csfFileParts();

  describe('attached', () => {
    const store = {
      componentStoriesFromCSFFile: () => [story],
    } as unknown as StoryStore<Renderer>;
    const context = new DocsContext(channel, store, renderStoryToElement, [csfFile]);
    context.attachCSFFile(csfFile);

    it('works for story exports', () => {
      expect(context.resolveModuleExport(storyExport)).toEqual({ type: 'story', story });
    });

    it('works for meta exports', () => {
      expect(context.resolveModuleExport(metaExport)).toEqual({ type: 'meta', csfFile });
    });

    it('works for full module exports', () => {
      expect(context.resolveModuleExport(moduleExports)).toEqual({ type: 'meta', csfFile });
    });

    it('works for components', () => {
      expect(context.resolveModuleExport(component)).toEqual({ type: 'component', component });
    });

    it('finds primary story', () => {
      expect(context.resolveModuleExport('story')).toEqual({ type: 'story', story });
    });

    it('finds attached CSF file', () => {
      expect(context.resolveModuleExport('meta')).toEqual({ type: 'meta', csfFile });
    });

    it('finds attached component', () => {
      expect(context.resolveModuleExport('component')).toEqual({ type: 'component', component });
    });
  });

  describe('unattached', () => {
    const store = {
      componentStoriesFromCSFFile: () => [story],
    } as unknown as StoryStore<Renderer>;
    const context = new DocsContext(channel, store, renderStoryToElement, [csfFile]);

    it('works for story exports', () => {
      expect(context.resolveModuleExport(storyExport)).toEqual({ type: 'story', story });
    });

    it('works for meta exports', () => {
      expect(context.resolveModuleExport(metaExport)).toEqual({ type: 'meta', csfFile });
    });

    it('works for full module exports', () => {
      expect(context.resolveModuleExport(moduleExports)).toEqual({ type: 'meta', csfFile });
    });

    it('works for components', () => {
      expect(context.resolveModuleExport(component)).toEqual({ type: 'component', component });
    });

    it('throws for primary story', () => {
      expect(() => context.resolveModuleExport('story')).toThrow('No primary story attached');
    });

    it('throws for attached CSF file', () => {
      expect(() => context.resolveModuleExport('meta')).toThrow('No CSF file attached');
    });

    it('throws for attached component', () => {
      expect(() => context.resolveModuleExport('component')).toThrow('No CSF file attached');
    });
  });
});
