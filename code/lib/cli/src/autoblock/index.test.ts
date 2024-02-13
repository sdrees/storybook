import { expect, test, vi } from 'vitest';
import { autoblock } from './index';
import { JsPackageManagerFactory } from '@storybook/core-common';
import { createBlocker } from './types';
import { writeFile as writeFileRaw } from 'node:fs/promises';
import { logger } from '@storybook/node-logger';

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

const writeFile = vi.mocked(writeFileRaw);

const blockers = {
  alwaysPass: createBlocker({
    id: 'alwaysPass',
    check: async () => false,
    message: () => 'Always pass',
    log: () => 'Always pass',
  }),
  alwaysFail: createBlocker({
    id: 'alwaysFail',
    check: async () => ({ bad: true }),
    message: () => 'Always fail',
    log: () => '...',
  }),
  alwaysFail2: createBlocker({
    id: 'alwaysFail2',
    check: async () => ({ disaster: true }),
    message: () => 'Always fail 2',
    log: () => '...',
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
  expect(writeFile).toHaveBeenCalledWith(
    expect.any(String),
    expect.stringContaining('alwaysFail'),
    expect.any(Object)
  );
  expect(result).toBe('alwaysFail');
  expect(logger.plain).toHaveBeenCalledWith(expect.stringContaining('Oh no..'));

  expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
    "(alwaysFail):
    ..."
  `);
});

test('multiple fails', async () => {
  const result = await autoblock({ ...baseOptions }, [
    Promise.resolve({ blocker: blockers.alwaysPass }),
    Promise.resolve({ blocker: blockers.alwaysFail }),
    Promise.resolve({ blocker: blockers.alwaysFail2 }),
  ]);
  expect(writeFile.mock.calls[0][1]).toMatchInlineSnapshot(`
    "(alwaysFail):
    ...

    ----

    (alwaysFail2):
    ..."
  `);

  expect(result).toBe('alwaysFail');
});
