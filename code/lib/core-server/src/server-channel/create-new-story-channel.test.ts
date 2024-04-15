import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initCreateNewStoryChannel } from './create-new-story-channel';
import path from 'path';
import type { ChannelTransport } from '@storybook/channels';
import { Channel } from '@storybook/channels';
import { CREATE_NEW_STORYFILE, CREATE_NEW_STORYFILE_RESULT } from '@storybook/core-events';

vi.mock('@storybook/core-common', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@storybook/core-common')>();
  return {
    ...actual,
    getProjectRoot: vi.fn().mockReturnValue(process.cwd()),
  };
});

const mockFs = vi.hoisted(() => {
  return {
    writeFile: vi.fn(),
  };
});

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>();
  return {
    default: {
      ...actual,
      writeFile: mockFs.writeFile,
    },
  };
});

describe('createNewStoryChannel', () => {
  const transport = { setHandler: vi.fn(), send: vi.fn() } satisfies ChannelTransport;
  const mockChannel = new Channel({ transport });
  const createNewStoryFileEventListener = vi.fn();

  beforeEach(() => {
    transport.setHandler.mockClear();
    transport.send.mockClear();
    createNewStoryFileEventListener.mockClear();
  });

  describe('initCreateNewStoryChannel', () => {
    it('should emit an event with a story id', async () => {
      mockChannel.addListener(CREATE_NEW_STORYFILE_RESULT, createNewStoryFileEventListener);
      const cwd = process.cwd();

      initCreateNewStoryChannel(mockChannel, {
        configDir: path.join(cwd, '.storybook'),
        presets: {
          apply: (val: string) => {
            if (val === 'framework') {
              return Promise.resolve('@storybook/nextjs');
            }
            if (val === 'stories') {
              return Promise.resolve(['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)']);
            }
          },
        },
      } as any);

      mockChannel.emit(CREATE_NEW_STORYFILE, {
        componentFilePath: 'src/components/Page.jsx',
        componentExportName: 'Page',
        componentIsDefaultExport: true,
      });

      await vi.waitFor(() => {
        expect(createNewStoryFileEventListener).toHaveBeenCalled();
      });

      expect(createNewStoryFileEventListener).toHaveBeenCalledWith({
        error: null,
        result: {
          storyId: 'components-page--default',
        },
        success: true,
      });
    });

    it('should emit an error event if an error occurs', async () => {
      mockChannel.addListener(CREATE_NEW_STORYFILE_RESULT, createNewStoryFileEventListener);
      const cwd = process.cwd();

      mockFs.writeFile.mockImplementation(() => {
        throw new Error('Failed to write file');
      });

      initCreateNewStoryChannel(mockChannel, {
        configDir: path.join(cwd, '.storybook'),
        presets: {
          apply: (val: string) => {
            if (val === 'framework') {
              return Promise.resolve('@storybook/nextjs');
            }
            if (val === 'stories') {
              return Promise.resolve(['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)']);
            }
          },
        },
      } as any);

      mockChannel.emit(CREATE_NEW_STORYFILE, {
        componentFilePath: 'src/components/Page.jsx',
        componentExportName: 'Page',
        componentIsDefaultExport: true,
      });

      await vi.waitFor(() => {
        expect(createNewStoryFileEventListener).toHaveBeenCalled();
      });

      expect(createNewStoryFileEventListener).toHaveBeenCalledWith({
        error: 'An error occurred while creating a new story:\nFailed to write file',
        result: null,
        success: false,
      });
    });
  });
});
