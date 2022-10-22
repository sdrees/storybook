import type { Options } from '@storybook/core-common';

// `addons/x` is for the monorepo, `addon-x` is for normal usage
const packageRe = /(addons\/|addon-)(docs|controls)/;

export const hasDocsOrControls = (options: Options) =>
  options.presetsList?.some((preset) => packageRe.test(preset.name));
