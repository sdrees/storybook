import { expect, test, vi } from 'vitest';
import { autoblock } from './index';
import { JsPackageManagerFactory } from '@storybook/core-common';
import { createBlocker } from './types';
import { logger as loggerRaw } from '@storybook/node-logger';
import stripAnsi from 'strip-ansi';

vi.mock('node:fs/promises', () => ({
  writeFile: vi.fn(),
}));
vi.mock('boxen', () => ({
  default: vi.fn((x) => x),
}));
vi.mock('@storybook/node-logger', () => ({
  logger: {
    info: vi.fn(),
    line: vi.fn(),
    plain: vi.fn(),
  },
}));

const logger = vi.mocked(loggerRaw);

const blockers = {
  alwaysPass: createBlocker({
    id: 'alwaysPass',
    check: async () => false,
    log: () => 'Always pass',
  }),
  alwaysFail: createBlocker({
    id: 'alwaysFail',
    check: async () => ({ bad: true }),
    log: () => 'Always fail',
  }),
  alwaysFail2: createBlocker({
    id: 'alwaysFail2',
    check: async () => ({ disaster: true }),
    log: () => 'Always fail 2',
  }),
} as const;

const baseOptions: Parameters<typeof autoblock>[0] = {
  configDir: '.storybook',
  mainConfig: {
    stories: [],
  },
  mainConfigPath: '.storybook/main.ts',
  packageJson: {
    dependencies: {},
    devDependencies: {},
  },
  packageManager: JsPackageManagerFactory.getPackageManager({ force: 'npm' }),
};

test('with empty list', async () => {
  const result = await autoblock({ ...baseOptions }, []);
  expect(result).toBe(null);
  expect(logger.plain).not.toHaveBeenCalledWith(expect.stringContaining('No blockers found'));
});

test('all passing', async () => {
  const result = await autoblock({ ...baseOptions }, [
    Promise.resolve({ blocker: blockers.alwaysPass }),
    Promise.resolve({ blocker: blockers.alwaysPass }),
  ]);
  expect(result).toBe(null);
  expect(logger.plain).toHaveBeenCalledWith(expect.stringContaining('No blockers found'));
});

test('1 fail', async () => {
  const result = await autoblock({ ...baseOptions }, [
    Promise.resolve({ blocker: blockers.alwaysPass }),
    Promise.resolve({ blocker: blockers.alwaysFail }),
  ]);

  expect(result).toBe('alwaysFail');
  expect(logger.plain).toHaveBeenCalledWith(expect.stringContaining('Oh no..'));
  expect(stripAnsi(logger.plain.mock.calls[1][0])).toMatchInlineSnapshot(`
    "Blocking your upgrade because of the following issues:

    Always fail

    Fix the above issues and try running the upgrade command again."
  `);
});

test('multiple fails', async () => {
  const result = await autoblock({ ...baseOptions }, [
    Promise.resolve({ blocker: blockers.alwaysPass }),
    Promise.resolve({ blocker: blockers.alwaysFail }),
    Promise.resolve({ blocker: blockers.alwaysFail2 }),
  ]);
  expect(stripAnsi(logger.plain.mock.calls[1][0])).toMatchInlineSnapshot(`
    "Blocking your upgrade because of the following issues:

    Always fail

    Always fail 2

    Fix the above issues and try running the upgrade command again."
  `);

  expect(result).toBe('alwaysFail');
});
