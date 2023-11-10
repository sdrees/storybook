import type { PresetProperty, StorybookConfig } from '@storybook/types';
import { normalizeStories, commonGlobOptions } from '@storybook/core-common';
import { isAbsolute, join } from 'path';
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
  if (options?.build?.test?.removeMDXEntries) {
    const out = (
      await Promise.all(
        normalizeStories(entries, {
          configDir: options.configDir,
          workingDir: options.configDir,
        }).map(({ directory, files }) => {
          const pattern = join(directory, files);
          const absolutePattern = isAbsolute(pattern) ? pattern : join(options.configDir, pattern);

          return glob(slash(absolutePattern), {
            ...commonGlobOptions(absolutePattern),
            follow: true,
          });
        })
      )
    ).reduce((carry, s) => carry.concat(s), []);

    return out.filter((s) => !s.endsWith('.mdx'));
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
  if (options?.build?.test?.removeAutoDocs) {
    return {};
  }
  return input;
};
