import { glob as globlOriginal } from 'glob';
import { type StoriesEntry } from '@storybook/types';
import { normalizeStoriesEntry } from '@storybook/core-common';
import { join } from 'path';
import slash from 'slash';
import { removeMDXEntries } from '../remove-mdx-entries';

const glob = globlOriginal as jest.MockedFunction<typeof globlOriginal>;

const configDir = '/configDir/';
const workingDir = '/';

jest.mock('glob', () => ({ glob: jest.fn() }));

const createList = (list: { entry: StoriesEntry; result: string[] }[]) => {
  return list.reduce<Record<string, { result: string[]; entry: StoriesEntry }>>(
    (acc, { entry, result }) => {
      const { directory, files } = normalizeStoriesEntry(entry, {
        configDir,
        workingDir,
      });
      acc[slash(join('/', directory, files))] = { result, entry };
      return acc;
    },
    {}
  );
};

const createGlobMock = (input: ReturnType<typeof createList>) => {
  return async (k: string | string[]) => {
    if (Array.isArray(k)) {
      throw new Error('do not pass an array to glob during tests');
    }
    if (input[slash(k)]) {
      return input[slash(k)]?.result;
    }

    throw new Error('can not find key in input');
  };
};

test('empty', async () => {
  const list = createList([]);
  glob.mockImplementation(createGlobMock(list));

  await expect(() => removeMDXEntries(Object.keys(list), { configDir })).rejects
    .toThrowErrorMatchingInlineSnapshot(`
    "Storybook could not index your stories.
    Your main configuration somehow does not contain a 'stories' field, or it resolved to an empty array.

    Please check your main configuration file and make sure it exports a 'stories' field that is not an empty array.

    More info: https://storybook.js.org/docs/react/faq#can-i-have-a-storybook-with-no-local-stories
    "
  `);
});

test('minimal', async () => {
  const list = createList([{ entry: '*.js', result: [] }]);
  glob.mockImplementation(createGlobMock(list));

  const result = await removeMDXEntries(
    Object.values(list).map((e) => e.entry),
    { configDir }
  );

  expect(result).toMatchInlineSnapshot(`
    Array [
      Object {
        "directory": ".",
        "files": "*.js",
        "titlePrefix": "",
      },
    ]
  `);
});

test('multiple', async () => {
  const list = createList([
    { entry: '*.ts', result: [] },
    { entry: '*.js', result: [] },
  ]);
  glob.mockImplementation(createGlobMock(list));

  const result = await removeMDXEntries(
    Object.values(list).map((e) => e.entry),
    { configDir }
  );

  expect(result).toMatchInlineSnapshot(`
    Array [
      Object {
        "directory": ".",
        "files": "*.ts",
        "titlePrefix": "",
      },
      Object {
        "directory": ".",
        "files": "*.js",
        "titlePrefix": "",
      },
    ]
  `);
});

test('mdx but not matching any files', async () => {
  const list = createList([
    { entry: '*.mdx', result: [] },
    { entry: '*.js', result: [] },
  ]);
  glob.mockImplementation(createGlobMock(list));

  const result = await removeMDXEntries(
    Object.values(list).map((e) => e.entry),
    { configDir }
  );

  expect(result).toMatchInlineSnapshot(`
    Array [
      Object {
        "directory": ".",
        "files": "*.mdx",
        "titlePrefix": "",
      },
      Object {
        "directory": ".",
        "files": "*.js",
        "titlePrefix": "",
      },
    ]
  `);
});

test('removes entries that only yield mdx files', async () => {
  const list = createList([
    { entry: '*.mdx', result: ['/configDir/my-file.mdx'] },
    { entry: '*.js', result: [] },
  ]);
  glob.mockImplementation(createGlobMock(list));

  const result = await removeMDXEntries(
    Object.values(list).map((e) => e.entry),
    { configDir }
  );

  expect(result).toMatchInlineSnapshot(`
    Array [
      Object {
        "directory": ".",
        "files": "*.js",
        "titlePrefix": "",
      },
    ]
  `);
});

test('expands entries that only yield mixed files', async () => {
  const list = createList([
    { entry: '*.@(mdx|ts)', result: ['/configDir/my-file.mdx', '/configDir/my-file.ts'] },
    { entry: '*.js', result: [] },
  ]);
  glob.mockImplementation(createGlobMock(list));

  const result = await removeMDXEntries(
    Object.values(list).map((e) => e.entry),
    { configDir }
  );

  expect(result).toMatchInlineSnapshot(`
    Array [
      Object {
        "directory": ".",
        "files": "**/my-file.ts",
        "titlePrefix": "",
      },
      Object {
        "directory": ".",
        "files": "*.js",
        "titlePrefix": "",
      },
    ]
  `);
});

test('passes titlePrefix', async () => {
  const list = createList([
    {
      entry: { files: '*.@(mdx|ts)', directory: '.', titlePrefix: 'foo' },
      result: ['/configDir/my-file.mdx', '/configDir/my-file.ts'],
    },
  ]);
  glob.mockImplementation(createGlobMock(list));

  const result = await removeMDXEntries(
    Object.values(list).map((e) => e.entry),
    { configDir }
  );

  expect(result).toMatchInlineSnapshot(`
    Array [
      Object {
        "directory": ".",
        "files": "**/my-file.ts",
        "titlePrefix": "foo",
      },
    ]
  `);
});

test('expands to multiple entries', async () => {
  const list = createList([
    {
      entry: { files: '*.@(mdx|ts)', directory: '.', titlePrefix: 'foo' },
      result: [
        '/configDir/my-file.mdx',
        '/configDir/my-file1.ts',
        '/configDir/my-file2.ts',
        '/configDir/my-file3.ts',
      ],
    },
  ]);
  glob.mockImplementation(createGlobMock(list));

  const result = await removeMDXEntries(
    Object.values(list).map((e) => e.entry),
    { configDir }
  );

  expect(result).toMatchInlineSnapshot(`
    Array [
      Object {
        "directory": ".",
        "files": "**/my-file1.ts",
        "titlePrefix": "foo",
      },
      Object {
        "directory": ".",
        "files": "**/my-file2.ts",
        "titlePrefix": "foo",
      },
      Object {
        "directory": ".",
        "files": "**/my-file3.ts",
        "titlePrefix": "foo",
      },
    ]
  `);
});
