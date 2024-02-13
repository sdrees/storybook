import { createBlocker } from './types';
import { dedent } from 'ts-dedent';
import { glob } from 'glob';

export const blocker = createBlocker({
  id: 'storiesMdxUsage',
  async check() {
    const files = await glob('**/*.stories.mdx', { cwd: process.cwd() });
    if (files.length === 0) {
      return false;
    }
    return { files };
  },
  message(options, data) {
    return `Found ${data.files.length} stories.mdx ${
      data.files.length === 1 ? 'file' : 'files'
    }, these must be migrated.`;
  },
  log() {
    return dedent`
      Support for *.stories.mdx files has been removed.
      Please see the migration guide for more information:
      https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#dropping-support-for-storiesmdx-csf-in-mdx-format-and-mdx1-support
      
      Storybook will also require you to use MDX 3.0.0 or later.
      Check the migration guide for more information:
      https://mdxjs.com/blog/v3/

      Manually run the migration script to convert your stories.mdx files to CSF format documented here:
      https://storybook.js.org/docs/migration-guide#storiesmdx-to-mdxcsf
    `;
  },
});
