import { it } from 'node:test';
import { describe, expect } from 'vitest';
import { extractProperRendererNameFromFramework } from './get-renderer-name';

describe('get-renderer-name', () => {
  describe('extractProperRendererNameFromFramework', () => {
    it('should return the renderer name for a known framework', async () => {
      const renderer = await extractProperRendererNameFromFramework('@storybook/react');
      expect(renderer).toEqual('react');
    });

    it('should return null for an unknown framework', async () => {
      const renderer = await extractProperRendererNameFromFramework('@third-party/framework');
      expect(renderer).toBeNull();
    });
  });
});
