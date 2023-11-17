import type {
  Options,
  PresetProperty,
  StoriesEntry,
  StorybookConfig,
  TestBuildFlags,
} from '@storybook/types';
import { normalizeStories, commonGlobOptions } from '@storybook/core-common';
import { isAbsolute, join, relative } from 'path';
import slash from 'slash';
import { glob } from 'glob';

export const framework: PresetProperty<'framework', StorybookConfig> = async (config) => {
  // This will get called with the values from the user's main config, but before
  // framework preset from framework packages e.g. react-webpack5 gets called.
  // This means we can add default values to the framework config, before it's requested by other packages.
  const name = typeof config === 'string' ? config : config?.name;
  const options = typeof config === 'string' ? {} : config?.options || {};

  return {
    name,
    options,
  };
};

export const stories: PresetProperty<'stories', StorybookConfig> = async (entries, options) => {
  if (options?.build?.test?.disableMDXEntries) {
    const list = normalizeStories(entries, {
      configDir: options.configDir,
      workingDir: options.configDir,
      default_files_pattern: '**/*.@(stories.@(js|jsx|mjs|ts|tsx))',
    });
    const result = (
      await Promise.all(
        list.map(async ({ directory, files, titlePrefix }) => {
          const pattern = join(directory, files);
          const absolutePattern = isAbsolute(pattern) ? pattern : join(options.configDir, pattern);
          const absoluteDirectory = isAbsolute(directory)
            ? directory
            : join(options.configDir, directory);

          return {
            files: (
              await glob(slash(absolutePattern), {
                ...commonGlobOptions(absolutePattern),
                follow: true,
              })
            ).map((f) => relative(absoluteDirectory, f)),
            directory,
            titlePrefix,
          };
        })
      )
    ).flatMap<StoriesEntry>((expanded, i) => {
      const filteredEntries = expanded.files.filter((s) => !s.endsWith('.mdx'));
      // only return the filtered entries when there is something to filter
      // as webpack is faster with unexpanded globs
      let items = [];
      if (filteredEntries.length < expanded.files.length) {
        items = filteredEntries.map((k) => ({
          ...expanded,
          files: `**/${k}`,
        }));
      } else {
        items = [list[i]];
      }

      return items;
    });
    return result;
  }
  return entries;
};

export const typescript: PresetProperty<'typescript', StorybookConfig> = async (input, options) => {
  if (options?.build?.test?.disableDocgen) {
    return { ...(input ?? {}), reactDocgen: false, check: false };
  }
  return input;
};

export const docs: PresetProperty<'docs', StorybookConfig> = async (input, options) => {
  if (options?.build?.test?.disableAutoDocs) {
    return {};
  }
  return input;
};

const createTestBuildFeatures = (value: boolean): Required<TestBuildFlags> => ({
  disableBlocks: value,
  disabledAddons: value ? ['@storybook/addon-docs', '@storybook/addon-coverage'] : [],
  disableMDXEntries: value,
  disableAutoDocs: value,
  disableDocgen: value,
  disableSourcemaps: value,
  disableTreeShaking: value,
  esbuildMinify: value,
});

export const build = async (value: StorybookConfig['build'], options: Options) => {
  return {
    ...value,
    test: {
      ...createTestBuildFeatures(!!options.test),
      ...value?.test,
    },
  };
};
