import dedent from 'ts-dedent';
import { resolve } from 'path';
import { logger } from '@storybook/node-logger';
import {
  CLIOptions,
  LoadedPreset,
  LoadOptions,
  PresetConfig,
  Presets,
  BuilderOptions,
} from './types';
import { loadCustomPresets } from './utils/load-custom-presets';
import { serverRequire } from './utils/interpret-require';
import { safeResolve, safeResolveFrom } from './utils/safeResolve';

const isObject = (val: unknown): val is Record<string, any> =>
  val != null && typeof val === 'object' && Array.isArray(val) === false;
const isFunction = (val: unknown): val is Function => typeof val === 'function';

export function filterPresetsConfig(presetsConfig: PresetConfig[]): PresetConfig[] {
  return presetsConfig.filter((preset) => {
    const presetName = typeof preset === 'string' ? preset : preset.name;
    return !/@storybook[\\\\/]preset-typescript/.test(presetName);
  });
}

function resolvePresetFunction<T = any>(
  input: T[] | Function,
  presetOptions: any,
  framework: T,
  storybookOptions: InterPresetOptions
): T[] {
  const prepend = [framework as unknown as T].filter(Boolean);
  if (isFunction(input)) {
    return [...prepend, ...input({ ...storybookOptions, ...presetOptions })];
  }
  if (Array.isArray(input)) {
    return [...prepend, ...input];
  }

  return [];
}

/**
 * Parse an addon into either a managerEntries or a preset. Throw on invalid input.
 *
 * Valid inputs:
 * - '@storybook/addon-actions/manager'
 *   =>  { type: 'virtual', item }
 *
 * - '@storybook/addon-docs/preset'
 *   =>  { type: 'presets', item }
 *
 * - '@storybook/addon-docs'
 *   =>  { type: 'presets', item: '@storybook/addon-docs/preset' }
 *
 * - { name: '@storybook/addon-docs(/preset)?', options: { ... } }
 *   =>  { type: 'presets', item: { name: '@storybook/addon-docs/preset', options } }
 */
interface ResolvedAddonPreset {
  type: 'presets';
  name: string;
}
interface ResolvedAddonVirtual {
  type: 'virtual';
  name: string;
  managerEntries?: string[];
  previewAnnotations?: string[];
  presets?: (string | { name: string; options?: any })[];
}

export const resolveAddonName = (
  configDir: string,
  name: string,
  options: any
): ResolvedAddonPreset | ResolvedAddonVirtual => {
  const r = name.startsWith('/') ? safeResolve : safeResolveFrom.bind(null, configDir);
  const resolved = r(name);

  if (name.match(/\/(manager|register(-panel)?)(\.(js|ts|tsx|jsx))?$/)) {
    return {
      type: 'virtual',
      name,
      managerEntries: [resolved],
    };
  }
  if (name.match(/\/(preset)(\.(js|ts|tsx|jsx))?$/)) {
    return {
      type: 'presets',
      name: resolved,
    };
  }

  const path = name;

  // when user provides full path, we don't need to do anything!
  const managerFile = safeResolve(`${path}/manager`);
  const registerFile = safeResolve(`${path}/register`) || safeResolve(`${path}/register-panel`);
  const previewFile = safeResolve(`${path}/preview`);
  const presetFile = safeResolve(`${path}/preset`);

  if (!(managerFile || previewFile) && presetFile) {
    return {
      type: 'presets',
      name: presetFile,
    };
  }

  if (managerFile || registerFile || previewFile || presetFile) {
    const managerEntries = [];

    if (managerFile) {
      managerEntries.push(managerFile);
    }
    // register file is the old way of registering addons
    if (!managerFile && registerFile && !presetFile) {
      managerEntries.push(registerFile);
    }

    return {
      type: 'virtual',
      name: path,
      ...(managerEntries.length ? { managerEntries } : {}),
      ...(previewFile ? { previewAnnotations: [previewFile] } : {}),
      ...(presetFile ? { presets: [{ name: presetFile, options }] } : {}),
    };
  }

  return {
    type: 'presets',
    name: resolved,
  };
};

const map =
  ({ configDir }: InterPresetOptions) =>
  (item: any) => {
    const options = isObject(item) ? item.options || undefined : undefined;
    const name = isObject(item) ? item.name : item;
    try {
      const resolved = resolveAddonName(configDir, name, options);
      return {
        ...(options ? { options } : {}),
        ...resolved,
      };
    } catch (err) {
      logger.error(
        `Addon value should end in /manager or /preview or /register OR it should be a valid preset https://storybook.js.org/docs/react/addons/writing-presets/\n${item}`
      );
    }
    return undefined;
  };

function interopRequireDefault(filePath: string) {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  const result = require(filePath);

  const isES6DefaultExported =
    typeof result === 'object' && result !== null && typeof result.default !== 'undefined';

  return isES6DefaultExported ? result.default : result;
}

function getContent(input: any) {
  if (input.type === 'virtual') {
    const { type, name, ...rest } = input;
    return rest;
  }
  const name = input.name ? input.name : input;

  return interopRequireDefault(name);
}

export function loadPreset(
  input: PresetConfig,
  level: number,
  storybookOptions: InterPresetOptions
): LoadedPreset[] {
  try {
    // @ts-ignores
    const name: string = input.name ? input.name : input;
    // @ts-ignore
    const presetOptions = input.options ? input.options : {};

    let contents = getContent(input);

    if (typeof contents === 'function') {
      // allow the export of a preset to be a function, that gets storybookOptions
      contents = contents(storybookOptions, presetOptions);
    }

    if (Array.isArray(contents)) {
      const subPresets = contents;
      return loadPresets(subPresets, level + 1, storybookOptions);
    }

    if (isObject(contents)) {
      const { addons: addonsInput, presets: presetsInput, framework, ...rest } = contents;

      const subPresets = resolvePresetFunction(
        presetsInput,
        presetOptions,
        framework,
        storybookOptions
      );
      const subAddons = resolvePresetFunction(
        addonsInput,
        presetOptions,
        framework,
        storybookOptions
      );

      return [
        ...loadPresets([...subPresets], level + 1, storybookOptions),
        ...loadPresets(
          [...subAddons.map(map(storybookOptions))].filter(Boolean),
          level + 1,
          storybookOptions
        ),
        {
          name,
          preset: rest,
          options: presetOptions,
        },
      ];
    }

    throw new Error(dedent`
      ${input} is not a valid preset
    `);
  } catch (e) {
    const warning =
      level > 0
        ? `  Failed to load preset: ${JSON.stringify(input)} on level ${level}`
        : `  Failed to load preset: ${JSON.stringify(input)}`;

    logger.warn(warning);
    logger.error(e);

    return [];
  }
}

function loadPresets(
  presets: PresetConfig[],
  level: number,
  storybookOptions: InterPresetOptions
): LoadedPreset[] {
  if (!presets || !Array.isArray(presets) || !presets.length) {
    return [];
  }

  if (!level) {
    logger.info('=> Loading presets');
  }

  return presets.reduce((acc, preset) => {
    const loaded = loadPreset(preset, level, storybookOptions);
    return acc.concat(loaded);
  }, []);
}

function applyPresets(
  presets: LoadedPreset[],
  extension: string,
  config: any,
  args: any,
  storybookOptions: InterPresetOptions
): Promise<any> {
  const presetResult = new Promise((res) => res(config));

  if (!presets.length) {
    return presetResult;
  }

  return presets.reduce((accumulationPromise: Promise<unknown>, { preset, options }) => {
    const change = preset[extension];

    if (!change) {
      return accumulationPromise;
    }

    if (typeof change === 'function') {
      const extensionFn = change;
      const context = {
        preset,
        combinedOptions: {
          ...storybookOptions,
          ...args,
          ...options,
          presetsList: presets,
          presets: {
            apply: async (ext: string, c: any, a = {}) =>
              applyPresets(presets, ext, c, a, storybookOptions),
          },
        },
      };

      return accumulationPromise.then((newConfig) =>
        extensionFn.call(context.preset, newConfig, context.combinedOptions)
      );
    }

    return accumulationPromise.then((newConfig) => {
      if (Array.isArray(newConfig) && Array.isArray(change)) {
        return [...newConfig, ...change];
      }
      if (isObject(newConfig) && isObject(change)) {
        return { ...newConfig, ...change };
      }
      return change;
    });
  }, presetResult);
}

type InterPresetOptions = Omit<CLIOptions & LoadOptions & BuilderOptions, 'frameworkPresets'>;

export function getPresets(presets: PresetConfig[], storybookOptions: InterPresetOptions): Presets {
  const loadedPresets: LoadedPreset[] = loadPresets(presets, 0, storybookOptions);

  return {
    apply: async (extension: string, config: any, args = {}) =>
      applyPresets(loadedPresets, extension, config, args, storybookOptions),
  };
}

/**
 * Get the `framework` provided in main.js and also do error checking up front
 */
const getFrameworkPackage = (configDir: string) => {
  const main = serverRequire(resolve(configDir, 'main'));
  if (!main) return null;
  const { framework: frameworkPackage, features = {} } = main;
  if (features.breakingChangesV7 && !frameworkPackage) {
    throw new Error(dedent`
      Expected 'framework' in your main.js, didn't find one.

      You can fix this automatically by running:

      npx sb@next automigrate
    
      More info: https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#mainjs-framework-field
    `);
  }
  return frameworkPackage;
};

export function loadAllPresets(
  options: CLIOptions &
    LoadOptions &
    BuilderOptions & {
      corePresets: string[];
      overridePresets: string[];
      frameworkPresets: string[];
    }
) {
  const { corePresets = [], frameworkPresets = [], overridePresets = [], ...restOptions } = options;

  const frameworkPackage = getFrameworkPackage(options.configDir);
  const presetsConfig: PresetConfig[] = [
    ...corePresets,
    ...(frameworkPackage ? [] : frameworkPresets),
    ...loadCustomPresets(options),
    ...overridePresets,
  ];

  // Remove `@storybook/preset-typescript` and add a warning if in use.
  const filteredPresetConfig = filterPresetsConfig(presetsConfig);
  if (filteredPresetConfig.length < presetsConfig.length) {
    logger.warn(
      'Storybook now supports TypeScript natively. You can safely remove `@storybook/preset-typescript`.'
    );
  }

  return getPresets(filteredPresetConfig, restOptions);
}
