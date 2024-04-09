import { describe, expect, it } from 'vitest';
import path from 'path';
import { GenericParser } from './generic-parser';
import fs from 'fs';

const genericParser = new GenericParser();

const TEST_DIR = path.join(__dirname, '..', '__search-files-tests__');

describe('generic-parser', () => {
  it('should correctly return exports from CommonJS files', async () => {
    const content = fs.readFileSync(path.join(TEST_DIR, 'src', 'commonjs-module.js'), 'utf-8');
    const { exports } = await genericParser.parse(content);

    expect(exports).toEqual([
      {
        default: false,
        name: 'a',
      },
      {
        default: false,
        name: 'b',
      },
      {
        default: false,
        name: 'c',
      },
      {
        default: false,
        name: 'd',
      },
      {
        default: false,
        name: 'e',
      },
    ]);
  });

  it('should correctly return exports from ES modules', async () => {
    const content = fs.readFileSync(path.join(TEST_DIR, 'src', 'es-module.js'), 'utf-8');
    const { exports } = await genericParser.parse(content);

    expect(exports).toEqual([
      {
        default: false,
        name: 'p',
      },
      {
        default: false,
        name: 'q',
      },
      {
        default: false,
        name: 'C',
      },
      {
        default: false,
        name: 'externalName',
      },
      {
        default: false,
        name: 'ns',
      },
      {
        default: true,
        name: 'default',
      },
    ]);
  });
});
