import prompts from 'prompts';
import type { CLIOptions, CoreConfig } from '@storybook/types';
import { loadAllPresets, cache } from '@storybook/core-common';
import { telemetry } from '@storybook/telemetry';
import type { EventType } from '@storybook/telemetry';

type TelemetryOptions = {
  cliOptions?: CLIOptions;
  presetOptions?: Parameters<typeof loadAllPresets>[0];
};

const promptCrashReports = async () => {
  if (process.env.CI && process.env.NODE_ENV !== 'test') {
    return undefined;
  }

  const { enableCrashReports } = await prompts({
    type: 'confirm',
    name: 'enableCrashReports',
    message: `Would you like to send crash reports to Storybook?`,
    initial: true,
  });

  await cache.set('enableCrashReports', enableCrashReports);

  return enableCrashReports;
};

async function shouldSendError({ cliOptions, presetOptions }: TelemetryOptions) {
  if (cliOptions?.disableTelemetry) return false;

  // If we are running init or similar, we just have to go with true here
  if (!presetOptions) return true;

  // should we load the preset?
  const presets = await loadAllPresets({
    corePresets: [require.resolve('./presets/common-preset')],
    overridePresets: [],
    ...presetOptions,
  });

  // If the user has chosen to enable/disable crash reports in main.js
  // or disabled telemetry, we can return that
  const core = await presets.apply<CoreConfig>('core');
  if (core?.enableCrashReports !== undefined) return core.enableCrashReports;
  if (core?.disableTelemetry) return false;

  // Deal with typo, remove in future version (7.1?)
  const valueFromCache =
    (await cache.get('enableCrashReports')) ?? (await cache.get('enableCrashreports'));
  if (valueFromCache !== undefined) return valueFromCache;

  const valueFromPrompt = await promptCrashReports();
  if (valueFromPrompt !== undefined) return valueFromPrompt;

  return true;
}

export async function withTelemetry(
  eventType: EventType,
  options: TelemetryOptions,
  run: () => Promise<void>
) {
  telemetry('boot', { eventType }, { stripMetadata: true });

  try {
    await run();
  } catch (error) {
    try {
      if (await shouldSendError(options)) {
        await telemetry(
          'error',
          { eventType, error },
          {
            immediate: true,
            configDir: options.cliOptions?.configDir || options.presetOptions?.configDir,
            enableCrashReports: true,
          }
        );
      }
    } catch (err) {
      // if this throws an error, we just move on
    }

    throw error;
  }
}
