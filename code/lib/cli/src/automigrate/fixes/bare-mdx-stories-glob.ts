import chalk from 'chalk';
import dedent from 'ts-dedent';
import semver from 'semver';
import type { ConfigFile } from '@storybook/csf-tools';
import { readConfig, writeConfig } from '@storybook/csf-tools';
import { getStorybookInfo } from '@storybook/core-common';
import type { StoriesEntry } from 'lib/types/src';
import type { Fix } from '../types';

const logger = console;

const fixId = 'bare-mdx-stories-glob';

export interface BareMdxStoriesGlobRunOptions {
  main: ConfigFile;
  existingStoriesEntries: StoriesEntry[];
  nextStoriesEntries: StoriesEntry[];
}

const getNextGlob = (glob: string) => {
  // '../src/**/*.stories.@(mdx|js|jsx|ts|tsx)' -> '../src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'
  const extGlobsRegex = new RegExp(/(.*\.)(stories\.@.*)(\|mdx|mdx\|)(.*)$/i);
  if (glob.match(extGlobsRegex)) {
    return glob.replace(extGlobsRegex, '$1@(mdx|$2$4)');
  }

  // '../src/**/*.stories.*' -> '../src/**/*.@(mdx|stories.*)'
  const allStoriesExtensionsRegex = new RegExp(/(.*\.)(stories\.\*)$/i);
  if (glob.match(allStoriesExtensionsRegex)) {
    return glob.replace(allStoriesExtensionsRegex, '$1@(mdx|$2)');
  }

  // '../src/**/*.stories.mdx' -> '../src/**/*.mdx'
  return glob.replaceAll('.stories.mdx', '.mdx');
};

export const bareMdxStoriesGlob: Fix<BareMdxStoriesGlobRunOptions> = {
  id: fixId,
  async check({ packageManager }) {
    const packageJson = packageManager.retrievePackageJson();

    const { mainConfig, version: storybookVersion } = getStorybookInfo(packageJson);
    if (!mainConfig) {
      logger.warn('Unable to find storybook main.js config, skipping');
      return null;
    }

    const sbVersionCoerced = storybookVersion && semver.coerce(storybookVersion)?.version;
    if (!sbVersionCoerced) {
      throw new Error(dedent`
        ❌ Unable to determine storybook version.
        🤔 Are you running automigrate from your project directory?
      `);
    }

    if (!semver.gte(sbVersionCoerced, '7.0.0')) {
      return null;
    }

    const main = await readConfig(mainConfig);

    let existingStoriesEntries;

    try {
      existingStoriesEntries = main.getFieldValue(['stories']) as StoriesEntry[];
    } catch (e) {
      // throws in next null check below
    }

    if (!existingStoriesEntries) {
      throw new Error(dedent`
      ❌ Unable to determine Storybook stories globs, skipping ${chalk.cyan(fixId)} fix.
      
      In Storybook 7, we have deprecated defining stories in MDX files, and consequently have changed the suffix to simply .mdx.

      We were unable to automatically migrate your 'stories' config to include any .mdx file instead of just .stories.mdx.
      We suggest you make this change manually.

      To learn more about this change, see: ${chalk.yellow(
        'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#mdx-docs-files'
      )}
      `);
    }

    const nextStoriesEntries = existingStoriesEntries.map((entry) => {
      const isSpecifier = typeof entry !== 'string';
      const glob = isSpecifier ? entry.files : entry;

      if (!glob) {
        // storySpecifier without the 'files' property. Just add the existing to the next list
        return entry;
      }

      const nextGlob = getNextGlob(glob);
      return isSpecifier ? { ...entry, files: nextGlob } : nextGlob;
    });

    // bails if there are no changes
    if (
      existingStoriesEntries.length === nextStoriesEntries.length &&
      existingStoriesEntries.every((entry, index) => {
        const nextEntry = nextStoriesEntries[index];
        if (typeof entry === 'string') {
          return entry === nextEntry;
        }
        if (typeof nextEntry === 'string') {
          return false;
        }
        return entry.files === nextEntry.files;
      })
    ) {
      return null;
    }

    return { existingStoriesEntries, nextStoriesEntries, main };
  },

  prompt({ existingStoriesEntries, nextStoriesEntries }) {
    const prettyExistingStoriesEntries = existingStoriesEntries
      .map((entry) => JSON.stringify(entry, null, 2))
      .join('\n');
    const prettyNextStoriesEntries = nextStoriesEntries
      .map((entry) => JSON.stringify(entry, null, 2))
      .join('\n');
    return dedent`
    We've detected your project has one or more globs in your 'stories' config that matches .stories.mdx files:
      ${chalk.cyan(prettyExistingStoriesEntries)}
    
    In Storybook 7, we have deprecated defining stories in MDX files, and consequently have changed the suffix to simply .mdx.

    We can automatically migrate your 'stories' config to include any .mdx file instead of just .stories.mdx.
    That would result in the following 'stories' config:
      ${chalk.cyan(prettyNextStoriesEntries)}

    To learn more about this change, see: ${chalk.yellow(
      'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#mdx-docs-files'
    )}
  `;
  },

  async run({ dryRun, result: { nextStoriesEntries, main } }) {
    logger.info(dedent`✅ Setting 'stories' config:
      ${JSON.stringify(nextStoriesEntries, null, 2)}`);

    main.setFieldValue(['stories'], nextStoriesEntries);
    if (!dryRun) {
      await writeConfig(main);
    }
  },
};
