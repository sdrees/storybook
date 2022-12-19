/// <reference types="@types/jest" />;

import prompts from 'prompts';
import { loadAllPresets, cache } from '@storybook/core-common';
import { telemetry } from '@storybook/telemetry';

import { withTelemetry } from './withTelemetry';

jest.mock('prompts');
jest.mock('@storybook/core-common');
jest.mock('@storybook/telemetry');

const cliOptions = {};

it('works in happy path', async () => {
  const run = jest.fn();

  await withTelemetry('dev', { cliOptions }, run);

  expect(telemetry).toHaveBeenCalledTimes(1);
  expect(telemetry).toHaveBeenCalledWith('boot', { eventType: 'dev' }, { stripMetadata: true });
});

it('does not send boot when cli option is passed', async () => {
  const run = jest.fn();

  await withTelemetry('dev', { cliOptions: { disableTelemetry: true } }, run);

  expect(telemetry).toHaveBeenCalledTimes(0);
});

describe('when command fails', () => {
  const error = new Error('An Error!');
  const run = jest.fn(async () => {
    throw error;
  });

  it('sends boot message', async () => {
    await expect(async () => withTelemetry('dev', { cliOptions }, run)).rejects.toThrow(error);

    expect(telemetry).toHaveBeenCalledWith('boot', { eventType: 'dev' }, { stripMetadata: true });
  });

  it('does not send boot when cli option is passed', async () => {
    await expect(async () =>
      withTelemetry('dev', { cliOptions: { disableTelemetry: true } }, run)
    ).rejects.toThrow(error);

    expect(telemetry).toHaveBeenCalledTimes(0);
  });

  it('sends error message when no options are passed', async () => {
    await expect(async () => withTelemetry('dev', { cliOptions }, run)).rejects.toThrow(error);

    expect(telemetry).toHaveBeenCalledTimes(2);
    expect(telemetry).toHaveBeenCalledWith(
      'error',
      { eventType: 'dev', error },
      expect.objectContaining({})
    );
  });

  it('does not send error message when cli opt out is passed', async () => {
    await expect(async () =>
      withTelemetry('dev', { cliOptions: { disableTelemetry: true } }, run)
    ).rejects.toThrow(error);

    expect(telemetry).toHaveBeenCalledTimes(0);
    expect(telemetry).not.toHaveBeenCalledWith(
      'error',
      { eventType: 'dev', error },
      expect.objectContaining({})
    );
  });

  it('does not send error message when crash reports are disabled', async () => {
    jest.mocked(loadAllPresets).mockResolvedValueOnce({
      apply: async () => ({ enableCrashReports: false } as any),
    });
    await expect(async () =>
      withTelemetry('dev', { cliOptions: {} as any, presetOptions: {} as any }, run)
    ).rejects.toThrow(error);

    expect(telemetry).toHaveBeenCalledTimes(2);
    expect(telemetry).toHaveBeenCalledWith(
      'error',
      { eventType: 'dev' },
      expect.objectContaining({})
    );
  });

  it('does send error message when crash reports are enabled', async () => {
    jest.mocked(loadAllPresets).mockResolvedValueOnce({
      apply: async () => ({ enableCrashReports: true } as any),
    });

    await expect(async () =>
      withTelemetry('dev', { cliOptions: {} as any, presetOptions: {} as any }, run)
    ).rejects.toThrow(error);

    expect(telemetry).toHaveBeenCalledTimes(2);
    expect(telemetry).toHaveBeenCalledWith(
      'error',
      { eventType: 'dev', error },
      expect.objectContaining({})
    );
  });

  it('does not send full error message when telemetry is disabled', async () => {
    jest.mocked(loadAllPresets).mockResolvedValueOnce({
      apply: async () => ({ disableTelemetry: true } as any),
    });

    await expect(async () =>
      withTelemetry('dev', { cliOptions: {} as any, presetOptions: {} as any }, run)
    ).rejects.toThrow(error);

    expect(telemetry).toHaveBeenCalledTimes(1);
    expect(telemetry).not.toHaveBeenCalledWith(
      'error',
      expect.objectContaining({}),
      expect.objectContaining({})
    );
  });

  it('does send error messages when telemetry is disabled, but crash reports are enabled', async () => {
    jest.mocked(loadAllPresets).mockResolvedValueOnce({
      apply: async () => ({ disableTelemetry: true, enableCrashReports: true } as any),
    });

    await expect(async () =>
      withTelemetry('dev', { cliOptions: {} as any, presetOptions: {} as any }, run)
    ).rejects.toThrow(error);

    expect(telemetry).toHaveBeenCalledTimes(2);
    expect(telemetry).toHaveBeenCalledWith(
      'error',
      { eventType: 'dev', error },
      expect.objectContaining({})
    );
  });

  it('does not send error messages when disabled crash reports are cached', async () => {
    jest.mocked(loadAllPresets).mockResolvedValueOnce({
      apply: async () => ({} as any),
    });
    jest.mocked(cache.get).mockResolvedValueOnce(false);

    await expect(async () =>
      withTelemetry('dev', { cliOptions: {} as any, presetOptions: {} as any }, run)
    ).rejects.toThrow(error);

    expect(telemetry).toHaveBeenCalledTimes(2);
    expect(telemetry).toHaveBeenCalledWith(
      'error',
      { eventType: 'dev' },
      expect.objectContaining({})
    );
  });

  it('does send error messages when enabled crash reports are cached', async () => {
    jest.mocked(loadAllPresets).mockResolvedValueOnce({
      apply: async () => ({} as any),
    });
    jest.mocked(cache.get).mockResolvedValueOnce(true);

    await expect(async () =>
      withTelemetry('dev', { cliOptions: {} as any, presetOptions: {} as any }, run)
    ).rejects.toThrow(error);

    expect(telemetry).toHaveBeenCalledTimes(2);
    expect(telemetry).toHaveBeenCalledWith(
      'error',
      { eventType: 'dev', error },
      expect.objectContaining({})
    );
  });

  it('does not send error messages when disabled crash reports are prompted', async () => {
    jest.mocked(loadAllPresets).mockResolvedValueOnce({
      apply: async () => ({} as any),
    });
    jest.mocked(cache.get).mockResolvedValueOnce(undefined);
    jest.mocked(prompts).mockResolvedValueOnce({ enableCrashReports: false });

    await expect(async () =>
      withTelemetry('dev', { cliOptions: {} as any, presetOptions: {} as any }, run)
    ).rejects.toThrow(error);

    expect(telemetry).toHaveBeenCalledTimes(2);
    expect(telemetry).toHaveBeenCalledWith(
      'error',
      { eventType: 'dev' },
      expect.objectContaining({})
    );
  });

  it('does send error messages when enabled crash reports are prompted', async () => {
    jest.mocked(loadAllPresets).mockResolvedValueOnce({
      apply: async () => ({} as any),
    });
    jest.mocked(cache.get).mockResolvedValueOnce(undefined);
    jest.mocked(prompts).mockResolvedValueOnce({ enableCrashReports: true });

    await expect(async () =>
      withTelemetry('dev', { cliOptions: {} as any, presetOptions: {} as any }, run)
    ).rejects.toThrow(error);

    expect(telemetry).toHaveBeenCalledTimes(2);
    expect(telemetry).toHaveBeenCalledWith(
      'error',
      { eventType: 'dev', error },
      expect.objectContaining({})
    );
  });

  // if main.js has errors, we have no way to tell if they've disabled telemetry
  it('does not send error messages when presets fail to evaluate', async () => {
    jest.mocked(loadAllPresets).mockRejectedValueOnce(error);

    await expect(async () =>
      withTelemetry('dev', { cliOptions: {} as any, presetOptions: {} as any }, run)
    ).rejects.toThrow(error);

    expect(telemetry).toHaveBeenCalledTimes(1);
    expect(telemetry).not.toHaveBeenCalledWith(
      'error',
      { eventType: 'dev', error },
      expect.objectContaining({})
    );
  });
});
